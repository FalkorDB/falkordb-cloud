import { NextResponse } from "next/server";
import { createClient } from 'redis';
import { getUser } from '../auth/user';

export async function GET() {

    let user = await getUser()
    if (user instanceof NextResponse) {
        return user
    }

    const client = user.tls ?
        await createClient({
            url: `rediss://:${user.db_password}@${user.db_host}:${user.db_port}`,
            socket: {
                tls: true,
                rejectUnauthorized: false,
                ca: user.cacert ?? ""
            }
        }).connect()
        : await createClient({
            url: `redis://:${user.db_password}@${user.db_host}:${user.db_port}`
        }).connect()
        
    try {
        let result = await client.graph.list()
        return NextResponse.json({ result: { graphs: result } }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}
