export interface User {
    id: string,
    name: string | null
    email: string | null
    db_host: string | null,
    db_ip: string | null,
    db_port: number | null,
    db_create_time: string | null,
    tls: boolean | null,
    task_arn: string | null,
}