import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { createClient } from 'falkordb';
import { getUser } from '../auth/user';
import { getClient } from '../graph/client';

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

    let user = await getUser()
    if (user instanceof NextResponse) {
        return user
    }

    let body = await req.json()
    const name = body.name
    let exampleFiles = await getExampleFiles()
    const buffer = exampleFiles.get(name);
    if (!buffer) {
        return NextResponse.json({ message: "Example not found" }, { status: 404 })
    }

    try {
        const client = await getClient(user)
        await client.restore(name, 0, buffer);
        return NextResponse.json({ result: name }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: err }, { status: 500 })
    }
}