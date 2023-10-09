import authOptions from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server";
import dataSource from '../db/appDataSource';
import { UserEntity } from '../models/entities';
import { createClient, Graph } from 'redis';

export async function GET() {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    const email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Can't find user details" }, { status: 500 })
    }

    const user = await dataSource.manager.findOneBy(UserEntity, {
        email: email
    })

    const client = await createClient( {
        url: `redis://:${user?.db_password}@${user?.db_host}:${user?.db_port}`
    }).connect();

    try{
        let result = await client.graph.list()
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}