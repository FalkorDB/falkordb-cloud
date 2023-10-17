import { ECSClient, InvalidParameterException, CreateServiceCommand, ExecuteCommandCommand, RegisterTaskDefinitionCommand, ListTasksCommand, DescribeTaskDefinitionCommand, DescribeTasksCommand, StopTaskCommand, DeleteServiceCommand, DeregisterTaskDefinitionCommand, DeleteTaskDefinitionsCommand, waitUntilServicesStable } from "@aws-sdk/client-ecs";
import { EC2Client, DescribeNetworkInterfacesCommand } from "@aws-sdk/client-ec2";
import { Route53Client, ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import WebSocket from 'ws';

import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { UserEntity } from "../models/entities";
import { NextResponse } from "next/server";
import { generatePassword } from "./password";
import fs from 'fs/promises';
import path from "path";
import { v4 as uuidv4 } from 'uuid';

const SUBNETS = process.env.SUBNETS?.split(":");
const SECURITY_GROUPS = process.env.SECURITY_GROUPS?.split(":");
const ecsClient = new ECSClient({ region: process.env.REGION });
const ec2Client = new EC2Client({ region: process.env.REGION });
const route53Client = new Route53Client({ region: process.env.REGION });

function cancelTask(taskArn: string): Promise<any> {
    let params = {
        cluster: "falkordb",
        task: taskArn,
        reason: "User requested shutdown",
    };

    return ecsClient.send(new StopTaskCommand(params));
}

function deleteService(taskArn: string): Promise<any> {
    let params = {
        cluster: "falkordb",
        service: taskArn,
        force: true,
    }
    return ecsClient.send(new DeleteServiceCommand(params));
}

async function deleteTaskDefinition(taskArn: string) {
    const res = await ecsClient.send(new DescribeTaskDefinitionCommand({
        taskDefinition: taskArn,
    }));
    const res1 = await ecsClient.send(new DeregisterTaskDefinitionCommand({
        taskDefinition: `${taskArn}:${res.taskDefinition?.revision}`,
    }));
    const res2 = await ecsClient.send(new DeleteTaskDefinitionsCommand({
        taskDefinitions: [`${taskArn}:${res.taskDefinition?.revision}`],
    }));
}

function createTaskDefinition(name: string, password: string): RegisterTaskDefinitionCommand {
    let params = {
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
                        value: "1",
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
                        "awslogs-region": "eu-north-1",
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
function createService(user: string, taskDefinition: string): CreateServiceCommand {
    let params = {
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
                subnets: SUBNETS,
                assignPublicIp: "ENABLED",
                securityGroups: SECURITY_GROUPS
            },
        },
    }
    return new CreateServiceCommand(params)
}

async function waitForService(user: UserEntity, taskArn: string) {
    try {
        let waitECSTask = await waitUntilServicesStable(
            { client: ecsClient, maxWaitTime: 5, minDelay: 1 },
            { cluster: "falkordb", services: [taskArn] }
        )
        if (waitECSTask.state != 'SUCCESS') {
            return "";
        }

        const tasks = await ecsClient.send(new ListTasksCommand({
            cluster: "falkordb",
            serviceName: `falkordb-${user.id}`,
        }))
        let task = await ecsClient.send(new DescribeTasksCommand({
            cluster: "falkordb",
            tasks: tasks.taskArns ?? [],
        }))

        while (task.tasks?.[0].containers?.[0].lastStatus != "RUNNING") {
            await new Promise(resolve => setTimeout(resolve, 1000));
            task = await ecsClient.send(new DescribeTasksCommand({
                cluster: "falkordb",
                tasks: tasks.taskArns ?? [],
            }))
        }

        const res = await ecsClient.send(new ExecuteCommandCommand({
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

        const privateIp = task.tasks?.[0].containers?.[0].networkInterfaces?.[0].privateIpv4Address;
        if (!privateIp) {
            return "";
        }

        // Get the public IP address of the ECS task
        let network = await ec2Client.send(new DescribeNetworkInterfacesCommand({
            Filters: [
                {
                    Name: "private-ip-address",
                    Values: [privateIp],
                },
            ],
        }))

        const publicIp = network.NetworkInterfaces?.[0].Association?.PublicIp?.toString() ?? "";
        const dns = `${user.id}.falkordb.io`;

        const response = await route53Client.send(new ChangeResourceRecordSetsCommand({
            HostedZoneId: "Z0440970DLRH0Z0KZO8E",
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


        user.cacert = cacert;
        user.db_host = dns;
        return;
    } catch (err: any) {
        if (err.name === "TimeoutError") {
            return;
        }
        throw err;
    }
}

export async function POST() {

    // Verify that the user is logged in
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    const email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
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

        let task = createTaskDefinition(`falkordb-${user.id}`, password)
        const taskData = await ecsClient.send(task);

        // Start an ECS service using a predefined task in an existing cluster.
        let ecsTask = createService(user.id, `falkordb-${user.id}`)
        const data = await ecsClient.send(ecsTask);
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

        try {
            const tasks = await ecsClient.send(new ListTasksCommand({
                cluster: "falkordb",
                serviceName: `falkordb-${user.id}`,
            }))
            await deleteService(user.task_arn);
            const taskArns = tasks.taskArns ?? [];
            await Promise.all(taskArns.map(task => cancelTask(task)));
            await deleteTaskDefinition(`falkordb-${user.id}`);
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

        try {
            // Check if task is running
            await waitForService(user, user.task_arn)
            if (user.db_host == "") {
                return NextResponse.json({
                    host: user.db_host,
                    port: user.db_port,
                    password: user.db_password,
                    create_time: user.db_create_time,
                    cacert: user.cacert,
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
            status: "READY",
        }, { status: 200 })
    })
}