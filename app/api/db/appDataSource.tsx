import { DataSource, EntitySchema } from "typeorm";
import dataSourceOptions from "./options";
import { AccountEntity, SessionEntity, UserEntity } from "../models/entities";

const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [UserEntity, AccountEntity, SessionEntity, EntitySchema]
})

dataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))

export default dataSource;