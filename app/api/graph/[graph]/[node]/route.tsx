import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { getUser } from '@/app/api/auth/user';
import { NextRequest, NextResponse } from "next/server";
import { createClient, Graph } from 'redis';

export async function GET(request: NextRequest, { params }: { params: { graph: string, node: string } }) {

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
        }).connect();;

    const graph = new Graph(client, params.graph);

    try {
        let result = await graph.query("Match (s)-[r]->(t) where ID(s) = $id return r,t", { params: { id: parseInt(params.node) } })
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}