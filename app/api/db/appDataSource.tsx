import { DataSource } from "typeorm";
import dataSourceOptions from "./options";
import { AccountEntity, SessionEntity, UserEntity, VerificationTokenEntity} from "../models/entities";

const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [UserEntity, AccountEntity, SessionEntity, VerificationTokenEntity]
})

dataSource.initialize()
    .then(() => {
        console.log("Database connection established")
    })
    .catch((error) => console.log(error))

export default dataSource;