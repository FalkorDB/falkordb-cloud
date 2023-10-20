import { NextRequest, NextResponse } from "next/server";
import authOptions, { getEntityManager } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { UserEntity } from "@/app/api/models/entities";
import { REGIONS } from "../regions";
import { deleteSandBox } from "../sandbox";

export async function DELETE(request: NextRequest, { params }: { params: { task: string } }) {

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

        let user: UserEntity | null = await transactionalEntityManager.findOneBy(UserEntity, {
            email: email
        })

        // Stop an ECS service using a predefined task in an existing cluster.
        if (!user) {
            return NextResponse.json({ message: "Task run failed, can't find user details" }, { status: 500 })
        }

        // If the user is admin, we can delete any sandbox
        if(user.role === 'admin') {

            // Find the user own the sandbox by task_arn
            user = await transactionalEntityManager.findOneBy(UserEntity, {
                task_arn: params.task
            })

            if (!user) {
                return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
            }
        }

        // Verify the task arn is valid and owned by the user
        if(!user.task_arn || user.task_arn != params.task) {
            return NextResponse.json({ message: "Can't delete SandBox" }, { status: 401 })
        }

        return await deleteSandBox(user, transactionalEntityManager)
    })
}