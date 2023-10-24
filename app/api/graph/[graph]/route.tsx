import { NextRequest, NextResponse } from "next/server";
import { createClient, Graph } from 'redis';
import { getUser } from '../../auth/user';

export async function GET(request: NextRequest, { params }: { params: { graph: string } }) {

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
        }).connect();

    const graph = new Graph(client, params.graph);

    const q = request.nextUrl.searchParams.get("q");
    if (!q) {
        return NextResponse.json({ message: "Missing query parameter 'q'" }, { status: 400 })
    }

    try {
        let result = await graph.query(q)
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}