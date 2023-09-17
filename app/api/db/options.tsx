import { entities } from "@auth/typeorm-adapter";
import { DataSourceOptions } from "typeorm"

const env = process.env.NODE_ENV;
const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: (process.env.POSTGRES_HOST || "localhost") as string,
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER as string,
    password: process.env.POSTGRES_PASSWORD as string,
    database: (process.env.POSTGRES_DATABASE || "falkordb") as string,
    synchronize: true,
    ssl: (env == "development" ? undefined : {
        rejectUnauthorized: false,
        requestCert: true,
    }),
}

export default dataSourceOptions;