import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { UserEntity } from '@/app/api/models/entities';
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server";
import { createClient, Graph } from 'redis';

export async function GET(request: NextRequest, { params }: { params: { graph: string, node: string } }) {

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
        email: email
    })

    const client = await createClient({
        url: `redis://:${user?.db_password}@${user?.db_host}:${user?.db_port}`
    }).connect();

    const graph = new Graph(client, params.graph);
    
    try {
        let result = await graph.query("Match (s)-[r]->(t) where ID(s) = $id return r,t", { params: { id: parseInt(params.node) } })
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}