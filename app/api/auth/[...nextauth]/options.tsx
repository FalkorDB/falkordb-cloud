import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github"
import { TypeORMAdapter } from "@auth/typeorm-adapter"
import { Adapter } from "next-auth/adapters";
import dataSourceOptions from "@/app/api/db/options";
import * as entities from "@/app/api/models/entities";

const authOptions : AuthOptions = {
    adapter: TypeORMAdapter(dataSourceOptions, {entities}) as Adapter,
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


export default authOptions