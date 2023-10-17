import authOptions, { getEntityManager } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server";
import { UserEntity } from '../models/entities';
import { createClient } from 'redis';
import fs from 'fs/promises';
import path from 'path';

// Load example files
let exampleFiles = new Map<string, Buffer>()
let exampleFileNames: string[] = []
const p = path.resolve(process.cwd(), 'app/examples')
fs.readdir(p).then((files) => {
    files.forEach(file => {
        fs.readFile(`${p}/${file}`, { encoding: 'hex' })
            .then((data) => {
                const buffer = Buffer.from(data, 'hex')
                const fileName = file.split('.')[0]
                exampleFiles.set(fileName, buffer)
                exampleFileNames.push(fileName)
            })
    })
})

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

    const client = user?.tls ?
        await createClient({
            url: `rediss://:${user?.db_password}@${user?.db_host}:${user?.db_port}`,
            socket: {
                tls: true,
                rejectUnauthorized: false,
                ca: user?.cacert ?? ""
            }
        }).connect()
        : await createClient({
            url: `redis://:${user?.db_password}@${user?.db_host}:${user?.db_port}`
        }).connect();;


    try {
        let result = await client.graph.list()
        return NextResponse.json({ result: { graphs: result, examples: exampleFileNames } }, { status: 200 })
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

    const client = user?.tls ?
        await createClient({
            url: `rediss://:${user?.db_password}@${user?.db_host}:${user?.db_port}`,
            socket: {
                tls: true,
                rejectUnauthorized: false,
                ca: user?.cacert ?? ""
            }
        }).connect()
        : await createClient({
            url: `redis://:${user?.db_password}@${user?.db_host}:${user?.db_port}`
        }).connect();;

    let body = await req.json()
    const name = body.name

    try {
        const buffer = exampleFiles.get(name);
        if (!buffer) {
            return NextResponse.json({ message: "Example not found" }, { status: 404 })
        }
        await client.restore(name, 0, buffer, { REPLACE: true });
        return NextResponse.json({ result: name }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ message: err }, { status: 500 })
    }
}