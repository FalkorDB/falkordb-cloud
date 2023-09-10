import { NextResponse } from 'next/server'
import { ECSClient, RunTaskCommand, StartTaskCommand } from "@aws-sdk/client-ecs";

const SUBNETS = process.env.SUBNETS?.split(":");
const SECURITY_GROUPS = process.env.SECURITY_GROUPS?.split(":");

export async function POST(request: Request) {

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

    const run = async () => {
        try {
            const data = await client.send(new RunTaskCommand(params));
            console.log("Success, task started!", data);
        } catch (err) {
            console.log("Error", err);
        }
    }

    run();

    return NextResponse.json({ message: "Task Started" })
}