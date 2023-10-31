import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ValueTransformer,
} from "typeorm"

const transformer: Record<"date" | "bigint", ValueTransformer> = {
  date: {
    from: (date: string | null) => date && new Date(parseInt(date, 10)),
    to: (date?: Date) => date?.valueOf().toString(),
  },
  bigint: {
    from: (bigInt: string | null) => bigInt && parseInt(bigInt, 10),
    to: (bigInt?: number) => bigInt?.toString(),
  },
}

@Entity("UserEntity", { name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar", nullable: true })
  name!: string | null

  @Column({ type: "varchar", nullable: true, unique: true })
  email!: string | null

  @Column({ type: "varchar", nullable: true, transformer: transformer.date })
  emailVerified!: string | null

  @Column({ type: "varchar", nullable: true })
  image!: string | null

  @Column({ type: "varchar", nullable: true })
  role!: string | null

  @OneToMany<SessionEntity>("SessionEntity", "userId")
  sessions!: SessionEntity[]

  @OneToMany<AccountEntity>("AccountEntity", "userId")
  accounts!: AccountEntity[]

  @Column({ type: "varchar", nullable: true })
  db_host!: string | null

  @Column({ type: "varchar", nullable: true })
  db_ip!: string | null

  @Column({ type: "int", nullable: true })
  db_port!: number | null

  @Column({ type: "varchar", nullable: true })
  db_password!: string | null

  @Column({ type: "varchar", nullable: true })
  db_username!: string | null

  @Column({ type: "timestamptz", nullable: true })
  db_create_time!: Date | null

  @Column({ type: "varchar", nullable: true })
  task_arn!: string | null

  @Column({ type: "varchar", nullable: true })
  cacert!: string | null

  @Column({ type: "boolean", nullable: true })
  tls: boolean | null = false
}

@Entity("AccountEntity", { name: "accounts" })
export class AccountEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  userId!: string

  @Column()
  type!: string

  @Column()
  provider!: string

  @Column()
  providerAccountId!: string

  @Column({ type: "varchar", nullable: true })
  refresh_token!: string | null

  @Column({ type: "varchar", nullable: true })
  access_token!: string | null

  @Column({
    nullable: true,
    type: "bigint",
    transformer: transformer.bigint,
  })
  expires_at!: number | null

  @Column({ type: "varchar", nullable: true })
  token_type!: string | null

  @Column({ type: "varchar", nullable: true })
  scope!: string | null

  @Column({ type: "varchar", nullable: true })
  id_token!: string | null

  @Column({ type: "varchar", nullable: true })
  session_state!: string | null

  @Column({ type: "varchar", nullable: true })
  oauth_token_secret!: string | null

  @Column({ type: "varchar", nullable: true })
  oauth_token!: string | null

  @ManyToOne<UserEntity>("UserEntity", "accounts", {
    createForeignKeyConstraints: true,
  })
  user!: UserEntity
}

@Entity("SessionEntity", { name: "sessions" })
export class SessionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  sessionToken!: string

  @Column({ type: "uuid" })
  userId!: string

  @Column({ transformer: transformer.date })
  expires!: string

  @ManyToOne<UserEntity>("UserEntity", "sessions")
  user!: UserEntity
}

@Entity("VerificationTokenEntity", { name: "verification_tokens" })
export class VerificationTokenEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  token!: string

  @Column()
  identifier!: string

  @Column({ transformer: transformer.date })
  expires!: string
}