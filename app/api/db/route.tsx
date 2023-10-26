import { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { UserEntity } from "../models/entities";
import { NextRequest, NextResponse } from "next/server";
import { generatePassword } from "./password";
import { REGIONS, Region } from "./regions";
import { Sandbox } from "./sandbox";
import { getUser } from "../auth/user";
import { getClient } from "../graph/client";
import { USER_ACL_COMMANDS, USER_ACL_KEYS } from "./acl";
import { createService, createTaskDefinition, deleteSandBox, waitForService } from "./service";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ""
if (ADMIN_PASSWORD == "") {
    throw new Error("ADMIN_PASSWORD is not defined")
}

async function setAcl(user: UserEntity) {

    let client = await getClient(user)
    const password = generatePassword(32);

    // TODO use other username for ACL
    await client.aclSetUser("falkordb", ["on", `>${password}`, ...USER_ACL_KEYS, ...USER_ACL_COMMANDS])

    user.db_password = password
    user.db_username = "falkordb"
}

export async function POST(req: NextRequest) {

    const json = await req.json()
    let regionName = json.region
    let tls = json.tls
    const region = REGIONS.get(regionName)
    if (!region) {
        return NextResponse.json({ message: `Task run failed, can't find region: ${regionName}` }, { status: 401 })
    }

    let manager = await getEntityManager()
    return manager.transaction("SERIALIZABLE", async (transactionalEntityManager) => {

        let user = await getUser(undefined, transactionalEntityManager)
        if (user instanceof NextResponse) {
            return user
        }

        if (user.task_arn) {
            return NextResponse.json({ message: "Sandbox already exits" }, { status: 409 })
        }

        let task = createTaskDefinition(region, tls, `falkordb-${user.id}`, ADMIN_PASSWORD)
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
        user.db_ip = "";
        user.db_port = 6379;
        user.db_create_time = new Date();
        user.tls = tls;

        await transactionalEntityManager.save(user)
        return NextResponse.json({ message: "Task Started" }, { status: 201 })
    })
}

export async function DELETE() {

    let manager = await getEntityManager()
    return await manager.transaction("SERIALIZABLE", async (transactionalEntityManager) => {

        let user = await getUser(undefined, transactionalEntityManager)
        if (user instanceof NextResponse) {
            return user
        }

        if (!user.task_arn) {
            return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
        }

        await deleteSandBox(user, transactionalEntityManager)

        return NextResponse.json({ message: "Task Stopped" }, { status: 200 })
    })
}

export async function GET() {

    let manager = await getEntityManager()
    return await manager.transaction("SERIALIZABLE", async (transactionalEntityManager) => {

        let user = await getUser(undefined, transactionalEntityManager)
        if (user instanceof NextResponse) {
            return user
        }

        if (!user.task_arn) {
            return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
        }

        // Check if sandbox exist and live
        let sandBoxReady = false
        if (user.db_host && user.db_host!=""){
            try{
                let client = await getClient(user)
                await client.ping()
                sandBoxReady = true
            } catch(err){
                console.warn(err)
            }
        }

        // Check if task is running and get the public IP address
        if (!sandBoxReady) {

            // Get the region name from the task ARN 
            // e.g. arn:aws:ecs:eu-north-1:119146126346:task/falkordb/f7fe437eb20e4259b861b4b91899771e
            const regionName = user.task_arn.split(":")[3]
            const region = REGIONS.get(regionName)
            if (!region) {
                return NextResponse.json({ message: `Task Get failed, can't find region: ${regionName}` }, { status: 500 })
            }

            try {
                // Check if task is running
                await waitForService(region, user, user.task_arn)

                // Check if task is running and get the public IP address
                if (user.db_host == "") {

                    let sandbox: Sandbox = {
                        host: user.db_host?? "",
                        port: user.db_port?? 6379,
                        password: user.db_password?? "",
                        username: user.db_username?? "",
                        create_time: user.db_create_time?.toISOString()?? "",
                        cacert: user.cacert?? "",
                        tls: user.tls?? false,
                        status: "BUILDING",
                    }
                    return NextResponse.json(sandbox, { status: 200 })
                }

                await setAcl(user)

                await transactionalEntityManager.save(user)
            } catch (err) {
                // Fatal error in the task 
                // TODO consider retry on network issues
                // await cancelTask(taskArn);
                console.error("Task run failed", err);
                user.task_arn = null;
                await transactionalEntityManager.save(user)
                return NextResponse.json({ message: "Task run failed" }, { status: 500 })
            }
        }

        let sandbox: Sandbox = {
            host: user.db_host?? "",
            port: user.db_port?? 6379,
            password: user.db_password?? "",
            username: user.db_username?? "",
            create_time: user.db_create_time?.toISOString()?? "",
            cacert: user.cacert?? "",
            tls: user.tls?? false,
            status: "READY",
        }

        return NextResponse.json(sandbox, { status: 200 })
    })
}
