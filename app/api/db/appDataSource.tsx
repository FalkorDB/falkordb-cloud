import { DataSource, EntitySchema } from "typeorm";
import dataSourceOptions from "./options";
import { AccountEntity, SessionEntity, UserEntity } from "../models/entities";

export const AppDataSource = new DataSource({
    ...dataSourceOptions,
    entities: [UserEntity, AccountEntity, SessionEntity, EntitySchema]
})

AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))