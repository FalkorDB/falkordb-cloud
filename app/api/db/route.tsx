import { ECSClient, InvalidParameterException, RunTaskCommand, RunTaskCommandInput, StopTaskCommand, waitUntilTasksRunning } from "@aws-sdk/client-ecs";
import { EC2Client, DescribeNetworkInterfacesCommand } from "@aws-sdk/client-ec2";

import authOptions from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { UserEntity } from "../models/entities";
import dataSource from "./appDataSource"
import { NextResponse } from "next/server";
import { generatePassword } from "./password";

const SUBNETS = process.env.SUBNETS?.split(":");
const SECURITY_GROUPS = process.env.SECURITY_GROUPS?.split(":");
const ecsClient = new ECSClient({ region: process.env.REGION });
const ec2Client = new EC2Client({ region: process.env.REGION });

function cancelTask(taskArn: string): Promise<any> {
    let params = {
        cluster: "falkordb",
        task: taskArn,
        reason: "User requested shutdown",
    };

    return ecsClient.send(new StopTaskCommand(params));
}

/// Start an ECS service using a predefined task in an existing cluster.
/// Use FARGATE_SPOT capacity provider.
function getTaskCommand(password: string): RunTaskCommand {
    let params = {
        cluster: "falkordb",
        taskDefinition: "falkordb",
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
        overrides: {
            containerOverrides: [
                {
                    name: "falkordb",
                    environment: [
                        {
                            name: "REDIS_ARGS",
                            value: `--requirepass ${password}`,
                        },
                    ],
                },
            ],
        },
    }
    return new RunTaskCommand(params)
}

async function waitForTask(user: UserEntity, taskArn: string): Promise<boolean> {
    let waitECSTask = await waitUntilTasksRunning(
        { "client": ecsClient, "maxWaitTime": 6000, "maxDelay": 1, "minDelay": 1 },
        { "cluster": "falkordb", "tasks": [taskArn] }
    )

    if (waitECSTask.state != 'SUCCESS') {
        return false;
    } 

    const command = new DescribeNetworkInterfacesCommand({
        Filters: [
            {
                Name: "private-ip-address",
                Values: [waitECSTask.reason?.tasks[0].containers[0].networkInterfaces[0].privateIpv4Address],
            },
        ],
    });

    // Get the public IP address of the ECS task
    let network = await ec2Client.send(command)
    user.db_host = network.NetworkInterfaces?.[0].Association?.PublicIp?.toString() ?? "";
    let repo = dataSource.getRepository(UserEntity)
    await repo.save(user)    
    return true
}

async function getQueryRunner() {

    if (!dataSource.isInitialized) {
        await dataSource.initialize()
    }

    // establish/take from pool real database connection using our new query runner
    // Create transaction to make sure only one sandbox is created per user
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    return queryRunner
}


export async function POST() {

    // Verify that the user is logged in
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    let email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    
    // establish/take from pool real database connection using our new query runner
    // Create transaction to make sure only one sandbox is created per user
    const queryRunner = await getQueryRunner()
    
    const user = await queryRunner.manager.findOneBy(UserEntity, {
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

    // Start an ECS service using a predefined task in an existing cluster.
    let ecsTask = getTaskCommand(password)
    const data = await ecsClient.send(ecsTask);
    if (data.failures?.length) {
        return NextResponse.json({ message: "Task run failed" }, { status: 500 })
    }
    let taskArn: string | undefined = data.tasks?.[0].taskArn
    if (typeof taskArn !== "string") {
        console.log("Task ARN is not defined " + taskArn);
        return NextResponse.json({ message: "Task run failed" }, { status: 500 })
    }

    // Save the sandbox info to the user table
    user.task_arn = taskArn;
    user.db_host = "";
    user.db_port = 6379;
    user.db_password = password;
    user.db_create_time = new Date();

    try {
        await queryRunner.manager.save(user)

        await queryRunner.commitTransaction()
    } catch (err) {
        console.log(err);
        await queryRunner.rollbackTransaction()

        await cancelTask(taskArn);

        return NextResponse.json({ message: "Task run failed" }, { status: 500 })
    } finally {
        await queryRunner.release()
    }

    let success = await waitForTask(user, taskArn);
    if(success){
        return NextResponse.json({ message: "Task run failed" }, { status: 500 })
    }
    return NextResponse.json({ message: "Task Started" }, { status: 201 })
}

export async function DELETE() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    let email = session.user?.email;

    if (!email) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    // establish/take from pool real database connection using our new query runner
    // Create transaction to make sure only one sandbox is created per user
    const queryRunner = await getQueryRunner()

    let user = await queryRunner.manager.findOneBy(UserEntity, {
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
        await cancelTask(user.task_arn);
    } catch (err) {
        // If the task is already stopped, the StopTask action returns an error.
        if (!(err instanceof InvalidParameterException)) {
            console.log(err);
            return NextResponse.json({ message: "Task stop failed" }, { status: 500 })
        }
    }

    user.task_arn = null;
    try {
        await queryRunner.manager.save(user)
        await queryRunner.commitTransaction()
    } catch (err) {
        console.log(err);
        await queryRunner.rollbackTransaction()
        return NextResponse.json({ message: "Task stop failed" }, { status: 500 })
    } finally {
        await queryRunner.release()
    }

    return NextResponse.json({ message: "Task Stopped" }, { status: 200 })
}

export async function GET() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    let email = session.user?.email;

    if (!email) {
        return NextResponse.json({ message: "Can't find user details" }, { status: 500 })
    }
    let repo = dataSource.getRepository(UserEntity)
    let user = await repo.findOneBy({
        email: email
    })

    // Stop an ECS service using a predefined task in an existing cluster.
    if (!user) {
        return NextResponse.json({ message: "Can't find user details" }, { status: 500 })
    }
    if (!user.task_arn) {
        return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
    }

    return NextResponse.json({
        host: user.db_host,
        port: user.db_port,
        password: user.db_password,
        create_time: user.db_create_time,
    }, { status: 200 })
}