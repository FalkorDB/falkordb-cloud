import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server";
import { UserEntity } from '../../models/entities';
import { createClient, Graph } from 'redis';

export async function GET(request: NextRequest,  { params }: { params: { graph: string } }) {

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

    const client = await createClient( {
        url: `rediss://:${user?.db_password}@${user?.db_host}:${user?.db_port}`,
        socket: {
            tls: true,
            rejectUnauthorized: false,
            ca: user?.cacert ?? ""
        }
    }).connect();

    const graph = new Graph(client, params.graph);
    
    const q = request.nextUrl.searchParams.get("q");
    if (!q) {
        return NextResponse.json({ message: "Missing query parameter 'q'" }, { status: 400 })
    }

    try{
        let result = await graph.query(q)
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}