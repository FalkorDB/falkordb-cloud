import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
  types,
} from "@mikro-orm/core"
import { defaultEntities } from "@auth/mikro-orm-adapter"

@Entity()
export class User extends defaultEntities.User {
  
  @Property({ type: types.string, nullable: true })
  db_host!: string | null

  @Property({ type: types.string, nullable: true })
  db_ip!: string | null

  @Property({ type: "int", nullable: true })
  db_port!: number | null

  @Property({ type: types.string, nullable: true })
  db_password!: string | null

  @Property({ type: types.string, nullable: true })
  db_username!: string | null

  @Property({ type: "timestamptz", nullable: true })
  db_create_time!: Date | null

  @Property({ type: types.string, nullable: true })
  task_arn!: string | null

  @Property({ type: types.string, nullable: true })
  cacert!: string | null

  @Property({ type: "boolean", nullable: true })
  tls: boolean | null = false
}