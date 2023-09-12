
import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github"
import { TypeORMAdapter } from "@auth/typeorm-adapter"
import { DataSourceOptions } from "typeorm"
import { Adapter } from "next-auth/adapters";

const connection: DataSourceOptions = {
  type: "postgres",
  host: (process.env.POSTGRES_HOST || "localhost") as string,
  port: Number(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER as string,
  password: process.env.POSTGRES_PASSWORD as string,
  database: (process.env.POSTGRES_DATABASE || "falkordb") as string,
  ssl: {
    rejectUnauthorized: false,
    requestCert: true,
  },
}

const authOptions: AuthOptions = {
  adapter: TypeORMAdapter(connection) as Adapter,
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

