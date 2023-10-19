import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server";
import { UserEntity } from '@/app/api/models/entities';

export async function GET() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    const email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Can't find user details" }, { status: 500 })
    }

    let manager = await getEntityManager()
    const user = await manager.findOneBy(UserEntity, {
        email: email,
        role: "admin"
    })

    if (!user) {
        return NextResponse.json({ message: "You must be admin to access this data" }, { status: 401 })
    }

    const users = await manager.find(UserEntity)
    const result = users.map((user) => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            db_host: user.db_host,
            db_port: user.db_port,
            db_create_time: user.db_create_time,
            tls: user.tls,
            task_arn: user.task_arn,            
        }
    })
    
    return NextResponse.json( result, { status: 200 })   
}