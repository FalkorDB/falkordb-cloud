import { NextRequest, NextResponse } from "next/server";
import { createClient, Graph } from 'redis';
import { getUser } from '../../auth/user';
import { getClient } from "../client";

export async function GET(request: NextRequest, { params }: { params: { graph: string } }) {

    let user = await getUser()
    if (user instanceof NextResponse) {
        return user
    }

    const q = request.nextUrl.searchParams.get("q");
    if (!q) {
        return NextResponse.json({ message: "Missing query parameter 'q'" }, { status: 400 })
    }

    try {
        const client = await getClient(user)
        const graph = new Graph(client, params.graph);    
        let result = await graph.query(q)
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}