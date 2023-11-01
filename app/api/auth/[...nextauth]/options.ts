import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import NextAuth from "next-auth"
import { MikroOrmAdapter } from "@auth/mikro-orm-adapter"
import { Adapter } from "next-auth/adapters"
import * as entities from "@/app/api/models/entities"

import type { Options } from "@mikro-orm/core"

const env = process.env.NODE_ENV;
const dataSourceOptions: Options = {
    type: "postgresql",
    host: (process.env.POSTGRES_HOST || "localhost") as string,
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER as string,
    password: process.env.POSTGRES_PASSWORD as string,
    dbName: (process.env.POSTGRES_DATABASE || "falkordb") as string,
    debug: process.env.DEBUG === "true" || process.env.DEBUG?.includes("db"),
    // synchronize: (env == "development" ? true : false),
    // ssl: (env == "development" ? undefined : {
    //     rejectUnauthorized: false,
    //     requestCert: true,
    // }),
}

const authOptions : AuthOptions = {
    adapter: MikroOrmAdapter(dataSourceOptions, {entities}) as Adapter,
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
}


export async function getEntityManager() {
    return await getManager({ dataSource: dataSourceOptions, entities: entities} )
}

export default authOptions