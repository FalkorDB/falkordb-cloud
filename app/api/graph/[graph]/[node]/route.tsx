import { getUser } from '@/app/api/auth/user';
import { NextRequest, NextResponse } from "next/server";
import { createClient, Graph } from 'redis';
import { getClient } from '../../client';

export async function GET(request: NextRequest, { params }: { params: { graph: string, node: string } }) {

    let user = await getUser()
    if (user instanceof NextResponse) {
        return user
    }

    try {
        const client = await getClient(user)
        const graph = new Graph(client, params.graph);    
        let result = await graph.query("Match (s)-[r]->(t) where ID(s) = $id return r,t", { params: { id: parseInt(params.node) } })
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}