
import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github"
import { TypeORMAdapter } from "@auth/typeorm-adapter"
import { DataSourceOptions } from "typeorm"
import { Adapter } from "next-auth/adapters";

const connection: DataSourceOptions = {
  type: "postgres",
  host: (process.env.DB_HOST || "localhost") as string,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  database: (process.env.DB_NAME || "falkordb") as string,
}

const authOptions: AuthOptions = {
  // adapter: TypeORMAdapter(connection) as Adapter,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    // }),
  ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

