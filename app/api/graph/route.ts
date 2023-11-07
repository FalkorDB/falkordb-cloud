import { NextResponse } from "next/server";
import { getUser } from '../auth/user';
import { getClient } from "./client";

export async function GET() {

    let user = await getUser()
    if (user instanceof NextResponse) {
        return user
    }   
        
    try {
        const client = await getClient(user)
        let result = await client.graph.list()
        return NextResponse.json({ result: { graphs: result } }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}
