import { DescribeNetworkInterfacesCommand } from "@aws-sdk/client-ec2";
import { CreateServiceCommand, CreateServiceCommandInput, DeleteServiceCommand, DeleteTaskDefinitionsCommand, DeregisterTaskDefinitionCommand, DescribeTaskDefinitionCommand, DescribeTasksCommand, DescribeTasksCommandOutput, ExecuteCommandCommand, InvalidParameterException, ListTasksCommand, ListTasksCommandOutput, RegisterTaskDefinitionCommand, RegisterTaskDefinitionCommandInput, StopTaskCommand, waitUntilServicesStable } from "@aws-sdk/client-ecs";
import { ChangeAction, ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import { REGIONS, Region } from "./regions";
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { UserEntity } from "../models/entities";
import { NextResponse } from "next/server";
import { EntityManager } from "typeorm";
import { getEntityManager } from "../auth/[...nextauth]/options";

const HOSTED_ZONE_ID = process.env.HOSTED_ZONE_ID ?? ""


export function createTaskDefinition(region: Region, tls: boolean, name: string, password: string): RegisterTaskDefinitionCommand {
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
export function createService(region: Region, user: string, taskDefinition: string): CreateServiceCommand {
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

async function getCACert(task: DescribeTasksCommandOutput, tasks: ListTasksCommandOutput, region: Region): Promise<string> {
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
        let accdata = ""
        ws.on('error', reject)

        ws.on('open', function open() {
            ws.send(JSON.stringify({
                "MessageSchemaVersion": "1.0",
                "RequestId": uuidv4(),
                "TokenValue": res.session?.tokenValue
            }))
        })

        ws.on('message', function message(data) {
            if (data instanceof Buffer) {
                let n = data.readInt32BE(0)
                data = data.subarray(4 + n)
            }
            accdata += data.toString()
        })

        ws.on('close', function close() {
            let sidx = accdata.indexOf("-----BEGIN CERTIFICATE-----")
            let eidx = accdata.indexOf("-----END CERTIFICATE-----")
            let cacert = accdata.substring(sidx, eidx + 25)
            resolve(cacert);
        })
    })

    ws.terminate()

    return cacert
}

async function updateDNS(publicIp: string, dns: string, region: Region, action: ChangeAction) {
    region.route53Client.send(new ChangeResourceRecordSetsCommand({
        HostedZoneId: HOSTED_ZONE_ID,
        ChangeBatch: {
            Comment: "add database dns",
            Changes: [
                {
                    Action: action,
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
}

export async function waitForService(region: Region, user: UserEntity, taskArn: string): Promise<void> {

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
            user.cacert = await getCACert(task, tasks, region)
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

        await updateDNS(publicIp, dns, region, ChangeAction.UPSERT);

        user.db_ip = publicIp;
        user.db_host = dns;
        return;
    } catch (err: any) {
        console.log(`waitForService error: ${err.name} ${err.message}`)

        if (err.name === "TimeoutError") {
            return;
        }
        throw err;
    }
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

function cancelTask(region: Region, taskArn: string): Promise<any> {
    let params = {
        cluster: "falkordb",
        task: taskArn,
        reason: "User requested shutdown",
    };

    return region.ecsClient.send(new StopTaskCommand(params));
}

export async function deleteSandBox(user: UserEntity, entityManager: EntityManager): Promise<NextResponse<{ message: string }>> {

    if (!user.task_arn) {
        return NextResponse.json({ message: "Can't delete SandBox" }, { status: 401 })
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
        const taskArns = tasks.taskArns ?? [];
        await Promise.all(taskArns.map(task => cancelTask(region, task)));
        await deleteTaskDefinition(region, `falkordb-${user.id}`);
        await updateDNS(user.db_ip?? "", user.db_host?? "", region, ChangeAction.DELETE);
    } catch (err) {        
        // If the task is already stopped, the StopTask action returns an error.
        if (!(err instanceof InvalidParameterException)) {
            console.error("Task stop failed", err);
            return NextResponse.json({ message: "Task stop failed" }, { status: 500 })
        }
    } 
    
    user.task_arn = null;
    user.db_host = null;
    user.db_ip = null;
    user.db_port = null;
    user.db_password = null;
    user.db_username = null;
    user.db_create_time = null;
    user.cacert = null;
    user.tls = false;

    let manager = entityManager?? getEntityManager()
    
    await manager.save(user)

    return NextResponse.json({ message: "Task Stopped" }, { status: 200 })
}