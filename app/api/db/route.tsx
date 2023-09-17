import { ECSClient, InvalidParameterException, RunTaskCommand, StopTaskCommand, waitUntilTasksRunning } from "@aws-sdk/client-ecs";
import authOptions from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { UserEntity } from "../models/entities";
import type { NextApiRequest, NextApiResponse } from 'next'
import { AppDataSource } from "./appDataSource"
import { NextResponse } from "next/server";

const SUBNETS = process.env.SUBNETS?.split(":");
const SECURITY_GROUPS = process.env.SECURITY_GROUPS?.split(":");
const ecsClient = new ECSClient({ region: process.env.REGION });

export async function POST() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    // Start an ECS service using a predefined task in an existing cluster.
    // Use FARGATE_SPOT capacity provider.
    let params = {
        cluster: "falkordb",
        taskDefinition: "falkordb",
        capacityProviderStrategy: [
            {
                capacityProvider: "FARGATE_SPOT",
                weight: 1,
                Base: 0,
            }
        ],
        platformVersion: "LATEST",
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: SUBNETS,
                assignPublicIp: "ENABLED",
                securityGroups: SECURITY_GROUPS
            },
        }
    };

    let email = session.user?.email;

    if (!email) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    let repo = AppDataSource.getRepository(UserEntity)
    let user = await repo.findOneBy({
        email: email
    })

    // Each user is allowed to create a single Sandbox
    if (!user) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    if (user.task_arn) {
        return NextResponse.json({ message: "Sandbox already exits" }, { status: 409 })
    }

    let ecsTask = new RunTaskCommand(params)
    const data = await ecsClient.send(ecsTask);
    if (data.failures?.length) {
        return NextResponse.json({ message: "Task run failed" }, { status: 500 })
    }
    let taskArn: string | undefined = data.tasks?.[0].taskArn
    if (typeof taskArn !== "string") {
        console.log("Task ARN is not defined " + taskArn);
        return NextResponse.json({ message: "Task run failed" }, { status: 500 })
    }

    user.task_arn = taskArn;
    user.db_host = "localhost";
    user.db_port = 6379;
    user.db_password = "password";
    user.db_create_time = new Date().toISOString();

    await repo.save(user)

    let waitECSTask = await waitUntilTasksRunning(
        { "client": ecsClient, "maxWaitTime": 6000, "maxDelay": 1, "minDelay": 1 },
        { "cluster": "falkordb", "tasks": [taskArn] }
    )
    // note: there are multiple waitECSTask states, check the documentation for more about that
    if (waitECSTask.state == 'SUCCESS') {
        return NextResponse.json({ message: "Task Started" }, { status: 201 })
    } else {
        return NextResponse.json({ message: "Task run failed" }, { status: 500 })
    }

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

    let repo = AppDataSource.getRepository(UserEntity)
    let user = await repo.findOneBy({
        email: email
    })

    // Stop an ECS service using a predefined task in an existing cluster.
    if (!user) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    if (!user.task_arn) {
        return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
    }

    let params = {
        cluster: "falkordb",
        task: user.task_arn,
        reason: "User requested shutdown",
    };

    try {
        const data = await ecsClient.send(new StopTaskCommand(params));
    } catch (err) {
        // If the task is already stopped, the StopTask action returns an error.
        if (err instanceof InvalidParameterException) {
            user.task_arn = null;
            await repo.save(user)
        }
        console.log(err);
        return NextResponse.json({ message: "Task stop failed" }, { status: 500 })
    }
    user.task_arn = null;
    await repo.save(user)

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
    let repo = AppDataSource.getRepository(UserEntity)
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