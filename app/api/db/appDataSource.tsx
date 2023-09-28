import { DataSource, EntitySchema } from "typeorm";
import dataSourceOptions from "./options";
import { AccountEntity, SessionEntity, UserEntity, VerificationTokenEntity} from "../models/entities";

const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [UserEntity, AccountEntity, SessionEntity, VerificationTokenEntity]
})

dataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))

export default dataSource;