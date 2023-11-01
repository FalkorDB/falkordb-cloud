import { User } from "../models/entities";
import authOptions, { getEntityManager } from "./[...nextauth]/options";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { EntityManager } from "@mikro-orm/core";

export async function getUser(role?: string, entityManager?: EntityManager) : Promise<User | NextResponse>{
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    const email = session.user?.email;
    if (!email) {
        return NextResponse.json({ message: "Can't find user details" }, { status: 500 })
    }

    let manager = entityManager?? await getEntityManager()
    let user = await manager.findOneBy(User, {
        email, role
    })
    return user?? NextResponse.json({ message: "User is unauthorized" }, { status: 401 })
}