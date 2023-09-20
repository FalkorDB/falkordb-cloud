import { DescribeTasksCommand, ECSClient, InvalidParameterException, RunTaskCommand, StopTaskCommand, waitUntilTasksRunning } from "@aws-sdk/client-ecs";
import authOptions from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { UserEntity } from "../models/entities";
import type { NextApiRequest, NextApiResponse } from 'next'
import { AppDataSource } from "./appDataSource"
import { NextResponse } from "next/server";
import { generatePassword } from "./password";

const SUBNETS = process.env.SUBNETS?.split(":");
const SECURITY_GROUPS = process.env.SECURITY_GROUPS?.split(":");
const ecsClient = new ECSClient({ region: process.env.REGION });

export async function POST() {

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

    // Each user is allowed to create a single Sandbox
    if (!user) {
        return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
    }

    if (user.task_arn) {
        return NextResponse.json({ message: "Sandbox already exits" }, { status: 409 })
    }


    let password = generatePassword(32);

    // Start an ECS service using a predefined task in an existing cluster.
    // Use FARGATE_SPOT capacity provider.
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
    };

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
    user.db_host = "";
    user.db_port = 6379;
    user.db_password = password;
    user.db_create_time = new Date();
    await repo.save(user)

    let waitECSTask = await waitUntilTasksRunning(
        { "client": ecsClient, "maxWaitTime": 6000, "maxDelay": 1, "minDelay": 1 },
        { "cluster": "falkordb", "tasks": [taskArn] }
    )



    // note: there are multiple waitECSTask states, check the documentation for more about that
    if (waitECSTask.state == 'SUCCESS') {

        // // Define the parameters for the describeTasks method
        // let describeTasksParams = {
        //     cluster: 'falkordb', // The name or ARN of the cluster that hosts the task
        //     tasks: [taskArn] // The list of task IDs or ARNs to describe
        // };

        // // Create an instance of the DescribeTasksCommand class
        // var command = new DescribeTasksCommand(describeTasksParams);
        // let data = await ecsClient.send(command)
        // console.log(JSON.stringify(data))


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