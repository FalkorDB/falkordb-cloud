import { ECSClient, InvalidParameterException, CreateServiceCommand, ExecuteCommandCommand, RegisterTaskDefinitionCommand, ListTasksCommand, DescribeTaskDefinitionCommand, DescribeTasksCommand, StopTaskCommand, DeleteServiceCommand, DeregisterTaskDefinitionCommand, DeleteTaskDefinitionsCommand, waitUntilServicesStable, CreateServiceCommandInput, RegisterTaskDefinitionCommandInput } from "@aws-sdk/client-ecs";
import { EC2Client, DescribeNetworkInterfacesCommand } from "@aws-sdk/client-ec2";
import { Route53Client, ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import WebSocket from 'ws';

import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { UserEntity } from "../models/entities";
import { NextRequest, NextResponse } from "next/server";
import { generatePassword } from "./password";
import { REGIONS, Region } from "./regions";
import { v4 as uuidv4 } from 'uuid';

const HOSTED_ZONE_ID = process.env.HOSTED_ZONE_ID ?? "";

function cancelTask(region: Region, taskArn: string): Promise<any> {
    let params = {
        cluster: "falkordb",
        task: taskArn,
        reason: "User requested shutdown",
    };

    return region.ecsClient.send(new StopTaskCommand(params));
}

function deleteService(region: Region, taskArn: string) {
    let params = {
        cluster: "falkordb",
        service: taskArn,
        force: true,
    }

    return region.ecsClient.send(new DeleteServiceCommand(params));
}

async function deleteTaskDefinition(region: Region, taskArn: string): Promise<any> {

    const res = await region.ecsClient.send(new DescribeTaskDefinitionCommand({
        taskDefinition: taskArn,
    }));
    const res1 = await region.ecsClient.send(new DeregisterTaskDefinitionCommand({
        taskDefinition: `${taskArn}:${res.taskDefinition?.revision}`,
    }));
    return await region.ecsClient.send(new DeleteTaskDefinitionsCommand({
        taskDefinitions: [`${taskArn}:${res.taskDefinition?.revision}`],
    }));
}

function createTaskDefinition(region: Region, tls: boolean, name: string, password: string): RegisterTaskDefinitionCommand {
    let params: RegisterTaskDefinitionCommandInput = {
        "family": name,
        "taskRoleArn": "arn:aws:iam::119146126346:role/ecsTaskExecutionRole",
        "executionRoleArn": "arn:aws:iam::119146126346:role/ecsTaskExecutionRole",
        "networkMode": "awsvpc",
        "containerDefinitions": [
            {
                "name": "falkordb",
                "image": "falkordb/falkordb:4.0.0-alpha.1",
                "cpu": 0,
                "portMappings": [
                    {
                        "name": "falkordb-6379-tcp",
                        "containerPort": 6379,
                        "hostPort": 6379,
                        "protocol": "tcp"
                    }
                ],
                "essential": true,
                "environment": [
                    {
                        name: "REDIS_ARGS",
                        value: `--requirepass ${password}`,
                    },
                    {
                        name: "TLS",
                        value: tls ? "1" : "0",
                    }
                ],
                "environmentFiles": [],
                "mountPoints": [],
                "volumesFrom": [],
                "ulimits": [],
                "logConfiguration": {
                    "logDriver": "awslogs",
                    "options": {
                        "awslogs-create-group": "true",
                        "awslogs-group": "/ecs/falkordb",
                        "awslogs-region": region.id,
                        "awslogs-stream-prefix": "ecs"
                    },
                    "secretOptions": []
                }
            }
        ],
        "requiresCompatibilities": [
            "FARGATE"
        ],
        "cpu": "256",
        "memory": "512",
        "runtimePlatform": {
            "cpuArchitecture": "X86_64",
            "operatingSystemFamily": "LINUX"
        }
    };

    return new RegisterTaskDefinitionCommand(params);
}

/// Start an ECS service using a predefined task in an existing cluster.
/// Use FARGATE_SPOT capacity provider.
function createService(region: Region, user: string, taskDefinition: string): CreateServiceCommand {
    let params: CreateServiceCommandInput = {
        cluster: "falkordb",
        serviceName: `falkordb-${user}`,
        taskDefinition: taskDefinition,
        enableExecuteCommand: true,
        desiredCount: 1,
        capacityProviderStrategy: [
            {
                capacityProvider: "FARGATE_SPOT",
                weight: 1,
                base: 0,
            }
        ],
        platformVersion: "LATEST",
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: region.subnets,
                assignPublicIp: "ENABLED",
                securityGroups: region.securityGroups,
            },
        },
    }
    return new CreateServiceCommand(params)
}

async function waitForService(region: Region, user: UserEntity, taskArn: string) : Promise<void> {
    try {
        let waitECSTask = await waitUntilServicesStable(
            { client: region.ecsClient, maxWaitTime: 5, minDelay: 1 },
            { cluster: "falkordb", services: [taskArn] }
        )

        // Task is not ready yet
        if (waitECSTask.state != 'SUCCESS') {
            return;
        }

        const tasks = await region.ecsClient.send(new ListTasksCommand({
            cluster: "falkordb",
            serviceName: `falkordb-${user.id}`,
        }))
        let task = await region.ecsClient.send(new DescribeTasksCommand({
            cluster: "falkordb",
            tasks: tasks.taskArns ?? [],
        }))

        if (user.tls) {
            while (task.tasks?.[0].containers?.[0].managedAgents?.[0].lastStatus != "RUNNING") {
                await new Promise(resolve => setTimeout(resolve, 1000));
                task = await region.ecsClient.send(new DescribeTasksCommand({
                    cluster: "falkordb",
                    tasks: tasks.taskArns ?? [],
                }))
            }

            const res = await region.ecsClient.send(new ExecuteCommandCommand({
                cluster: "falkordb",
                command: "cat /FalkorDB/tls/ca.crt",
                interactive: true,
                task: task.tasks?.[0].taskArn
            }));

            const ws = new WebSocket(res.session?.streamUrl ?? "");

            const cacert: string = await new Promise((resolve, reject) => {
                let accdata = "";
                ws.on('error', reject);

                ws.on('open', function open() {
                    ws.send(JSON.stringify({
                        "MessageSchemaVersion": "1.0",
                        "RequestId": uuidv4(),
                        "TokenValue": res.session?.tokenValue
                    }));
                });

                ws.on('message', function message(data) {
                    if (data instanceof Buffer) {
                        let n = data.readInt32BE(0);
                        data = data.slice(4 + n);
                    }
                    accdata += data.toString();
                });

                ws.on('close', function close() {
                    let sidx = accdata.indexOf("-----BEGIN CERTIFICATE-----");
                    let eidx = accdata.indexOf("-----END CERTIFICATE-----");
                    let cacert = accdata.substring(sidx, eidx + 25);
                    resolve(cacert);
                });
            });

            ws.terminate();

            user.cacert = cacert;
        }

        const privateIp = task.tasks?.[0].containers?.[0].networkInterfaces?.[0].privateIpv4Address;
        if (!privateIp) {
            return;
        }

        // Get the public IP address of the ECS task
        let network = await region.ec2Client.send(new DescribeNetworkInterfacesCommand({
            Filters: [
                {
                    Name: "private-ip-address",
                    Values: [privateIp],
                },
            ],
        }))

        const publicIp = network.NetworkInterfaces?.[0].Association?.PublicIp?.toString() ?? "";
        const dns = `${user.id}.falkordb.io`;

        const response = await region.route53Client.send(new ChangeResourceRecordSetsCommand({
            HostedZoneId: HOSTED_ZONE_ID,
            ChangeBatch: {
                Comment: "add database dns",
                Changes: [
                    {
                        Action: "UPSERT",
                        ResourceRecordSet: {
                            Name: dns,
                            Type: "A",
                            TTL: 300,
                            ResourceRecords: [
                                {
                                    Value: publicIp,
                                },
                            ],
                        },
                    },
                ],
            },
        }));

        user.db_host = dns;
        return;
    } catch (err: any) {
        if (err.name === "TimeoutError") {
            return;
        }
        throw err;
    }
}

export async function POST(req: NextRequest) {

    // Verify that the user is logged in
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    const email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    const json = await req.json()
    let regionName = json.region
    let tls = json.tls
    const region = REGIONS.get(regionName)
    if (!region) {
        return NextResponse.json({ message: `Task run failed, can't find region: ${regionName}` }, { status: 401 })
    }

    let manager = await getEntityManager()
    return manager.transaction("SERIALIZABLE", async (transactionalEntityManager) => {

        const user = await transactionalEntityManager.findOneBy(UserEntity, {
            email: email
        })

        // Each user is allowed to create a single Sandbox
        if (!user) {
            return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
        }

        if (user.task_arn) {
            return NextResponse.json({ message: "Sandbox already exits" }, { status: 409 })
        }

        const password = generatePassword(32);

        let task = createTaskDefinition(region, tls, `falkordb-${user.id}`, password)
        const taskData = await region.ecsClient.send(task);

        // Start an ECS service using a predefined task in an existing cluster.
        let ecsTask = createService(region, user.id, `falkordb-${user.id}`)
        const data = await region.ecsClient.send(ecsTask);
        let taskArn: string | undefined = data.service?.serviceArn
        if (typeof taskArn !== "string") {
            console.warn("Task ARN is not defined " + taskArn);
            return NextResponse.json({ message: "Task run failed" }, { status: 500 })
        }

        // Save the sandbox info to the user table
        user.task_arn = taskArn;
        user.db_host = "";
        user.db_port = 6379;
        user.db_password = password;
        user.db_create_time = new Date();
        user.tls = tls;

        await transactionalEntityManager.save(user)
        return NextResponse.json({ message: "Task Started" }, { status: 201 })
    })
}

export async function DELETE() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    const email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    let manager = await getEntityManager()
    return await manager.transaction("SERIALIZABLE", async (transactionalEntityManager) => {

        let user = await transactionalEntityManager.findOneBy(UserEntity, {
            email: email
        })

        // Stop an ECS service using a predefined task in an existing cluster.
        if (!user) {
            return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
        }

        if (!user.task_arn) {
            return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
        }

        // Get the region name from the task ARN 
        // e.g. arn:aws:ecs:eu-north-1:119146126346:task/falkordb/f7fe437eb20e4259b861b4b91899771e
        const regionName = user.task_arn.split(":")[3]
        const region = REGIONS.get(regionName)
        if (!region) {
            return NextResponse.json({ message: `Task delete failed, can't find region: ${regionName}` }, { status: 500 })
        }

        try {
            const tasks = await region.ecsClient.send(new ListTasksCommand({
                cluster: "falkordb",
                serviceName: `falkordb-${user.id}`,
            }))
            await deleteService(region, user.task_arn);
            await deleteService(region, user.task_arn);
            const taskArns = tasks.taskArns ?? [];
            await Promise.all(taskArns.map(task => cancelTask(region, task)));
            await deleteTaskDefinition(region, `falkordb-${user.id}`);
        } catch (err) {
            // If the task is already stopped, the StopTask action returns an error.
            if (!(err instanceof InvalidParameterException)) {
                console.error(err);
                return NextResponse.json({ message: "Task stop failed" }, { status: 500 })
            }
        }

        user.task_arn = null;
        await transactionalEntityManager.save(user)

        return NextResponse.json({ message: "Task Stopped" }, { status: 200 })
    })
}

export async function GET() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    const email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Can't find user details" }, { status: 500 })
    }

    let manager = await getEntityManager()
    return await manager.transaction("SERIALIZABLE", async (transactionalEntityManager) => {

        const user = await transactionalEntityManager.findOneBy(UserEntity, {
            email: email
        })
        if (!user) {
            return NextResponse.json({ message: "Can't find user details" }, { status: 500 })
        }
        if (!user.task_arn) {
            return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
        }

        // Get the region name from the task ARN 
        // e.g. arn:aws:ecs:eu-north-1:119146126346:task/falkordb/f7fe437eb20e4259b861b4b91899771e
        const regionName = user.task_arn.split(":")[3]
        const region = REGIONS.get(regionName)
        if (!region) {
            return NextResponse.json({ message: `Task delete failed, can't find region: ${regionName}` }, { status: 500 })
        }

        try {
            // Check if task is running
            await waitForService(region, user, user.task_arn)
            if (user.db_host == "") {
                return NextResponse.json({
                    host: user.db_host,
                    port: user.db_port,
                    password: user.db_password,
                    create_time: user.db_create_time,
                    cacert: user.cacert,
                    tls: user.tls,
                    status: "BUILDING",
                }, { status: 200 })
            }
            await transactionalEntityManager.save(user)
        } catch (err) {
            // Fatal error in the task 
            // TODO consider retry on network issues
            // await cancelTask(taskArn);
            console.error(err);
            user.task_arn = null;
            await transactionalEntityManager.save(user)
            return NextResponse.json({ message: "Task run failed" }, { status: 500 })
        }

        return NextResponse.json({
            host: user.db_host,
            port: user.db_port,
            password: user.db_password,
            create_time: user.db_create_time,
            cacert: user.cacert,
            tls: user.tls,
            status: "READY",
        }, { status: 200 })
    })
}