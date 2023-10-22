import { EntityManager } from "typeorm";
import { UserEntity } from "../models/entities";
import { DeleteServiceCommand, DeleteTaskDefinitionsCommand, DeregisterTaskDefinitionCommand, DescribeTaskDefinitionCommand, InvalidParameterException, ListTasksCommand, StopTaskCommand } from "@aws-sdk/client-ecs";
import { NextResponse } from "next/server";
import { REGIONS, Region } from "./regions";

export class Sandbox {

    public host: string;
    public port: number;
    public password: string;
    public create_time: string;
    public cacert: string;
    public tls: boolean;

    constructor(host: string, port: number, password: string, create_time: string, cacert: string, tls: boolean) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.create_time = create_time;
        this.cacert = cacert;
        this.tls = tls;
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

export async function deleteSandBox(user: UserEntity, transactionalEntityManager: EntityManager) : Promise<NextResponse<{message:string}>> {

        if(!user.task_arn) {
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
}
//# sourceMappingURL=sandbox.js.map
