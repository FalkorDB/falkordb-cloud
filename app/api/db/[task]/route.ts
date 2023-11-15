import { NextRequest, NextResponse } from "next/server";
import { UserEntity } from "@/app/api/models/entities";
import { getUser } from "../../auth/user";
import { getEntityManager } from "../../auth/[...nextauth]/options";
import { deleteSandBox } from "../service";

export async function DELETE(request: NextRequest, { params }: { params: { task: string } }) {

    let manager = await getEntityManager()
    return await manager.transaction("SERIALIZABLE", async (transactionalEntityManager) => {

        let res = await getUser(undefined, transactionalEntityManager)
        if (res instanceof NextResponse) {
            return res
        }

        let user: UserEntity = res;
        // If the user is admin, we can delete any sandbox
        if(user.role === 'admin') {

            // Find the user own the sandbox by task_arn
            let ownerUser = await transactionalEntityManager.findOneBy(UserEntity, {
                task_arn: params.task
            })

            if (!ownerUser) {
                return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
            }

            user = ownerUser
        }

        // Verify the task arn is valid and owned by the user
        if(!user.task_arn || user.task_arn != params.task) {
            return NextResponse.json({ message: "Can't delete SandBox" }, { status: 401 })
        }

        return await deleteSandBox(user, transactionalEntityManager)
    })
}