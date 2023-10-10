import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server";
import { UserEntity } from '../models/entities';
import { createClient } from 'redis';
import fs from 'fs/promises';

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
        email: email
    })

    const client = await createClient({
        url: `redis://:${user?.db_password}@${user?.db_host}:${user?.db_port}`
    }).connect();


    try {
        let result = await client.graph.list()
        let files = (await fs.readdir('public/examples')).map(f => f.split('.')[0]);
        return NextResponse.json({ result: { graphs: result, examples: files } }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}

export async function POST(req: NextRequest) {
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

    let body = await req.json()
    let name = body.name
    console.log(name)

    try {
        const data = await fs.readFile(`public/examples/${name}.dump`, { encoding: 'hex' });
        const buffer = Buffer.from(data, 'hex');
        await client.restore(name, 0, buffer, { REPLACE: true });
    } catch (err) {
        return NextResponse.json({ message: err }, { status: 400 })
    }

    return NextResponse.json({ result: name }, { status: 200 })
}