import { ECSClient, RunTaskCommand, StartTaskCommand } from "@aws-sdk/client-ecs";
import authOptions from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

const SUBNETS = process.env.SUBNETS?.split(":");
const SECURITY_GROUPS = process.env.SECURITY_GROUPS?.split(":");

export async function POST() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    // Create ECS service client object.
    const client = new ECSClient({ region:process.env.REGION });

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

    try {
        const data = await client.send(new RunTaskCommand(params));
        console.debug("Success, task started!", data);
    } catch (err) {
        console.log("Error", err);
        return NextResponse.json({ message: "Failed to start Task" }, { status: 500 })
    }

    return NextResponse.json({ message: "Task Started" })    
}