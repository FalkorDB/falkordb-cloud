import fs from 'fs/promises';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import authOptions, { getEntityManager } from '../auth/[...nextauth]/options';
import { UserEntity } from '../models/entities';
import { createClient } from 'redis';

// Load example files
let _exampleFiles = new Map<string, Buffer>()
async function getExampleFiles() {    
    if (_exampleFiles.size <= 0) {
        const p = path.join(process.cwd(), 'app/examples')
        let files = await fs.readdir(p)

        for (const file of files) {
            let data = await fs.readFile(`${p}/${file}`, { encoding: 'hex' })      
            const buffer = Buffer.from(data, 'hex')
            const fileName = file.split('.')[0]
            _exampleFiles.set(fileName, buffer)
        }
    }
    return _exampleFiles
}

let _exampleFileNames: string[] = []
async function getExampleFileNames() {
    if (_exampleFileNames.length <= 0) {
        const p = path.join(process.cwd(), 'app/examples')
        let files = await fs.readdir(p)
        for (const file of files) {
            const fileName = file.split('.')[0]
            _exampleFileNames.push(fileName)
        }
    }
    return _exampleFileNames
}

export async function GET() {
    let examples = await getExampleFileNames()
    return NextResponse.json({ result: { examples } }, { status: 200 })
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
        }).connect()

    let body = await req.json()
    const name = body.name
    let exampleFiles = await getExampleFiles()
    const buffer = exampleFiles.get(name);
    if (!buffer) {
        return NextResponse.json({ message: "Example not found" }, { status: 404 })
    }

    try {
        await client.restore(name, 0, buffer, { REPLACE: true });
        return NextResponse.json({ result: name }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: err }, { status: 500 })
    }
}