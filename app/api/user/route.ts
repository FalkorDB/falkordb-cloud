import { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { NextResponse } from "next/server";
import { UserEntity } from '@/app/api/models/entities';
import { getUser } from '../auth/user';
import { User } from './user';

export async function GET() {

    let manager = await getEntityManager()
    
    let adminUser = await getUser("admin", manager)
    if (adminUser instanceof NextResponse) {
        return adminUser
    }
    
    const users = await manager.find(UserEntity)
    const result: User[] = users.map((user) => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            db_host: user.db_host,
            db_ip: user.db_ip,
            db_port: user.db_port,
            db_create_time: user.db_create_time?.toISOString()??null,
            tls: user.tls,
            task_arn: user.task_arn,            
        }
    })
    
    return NextResponse.json( result, { status: 200 })   
}