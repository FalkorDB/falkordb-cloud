import { RedisClientType, RedisDefaultModules, createClient } from "redis";
import { UserEntity } from "../models/entities";
import { LRUCache } from 'lru-cache'


const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ""
if (ADMIN_PASSWORD == "") {
    throw new Error("ADMIN_PASSWORD is not defined")
}

const options = {
    
    max: 50,
  
    // for use when you need to clean up something when objects
    // are evicted from the cache
    dispose: (value: RedisClientType<any>, key: string) => {
        value.disconnect()
    },
  
    // 6min in ms
    ttl: 1000 * 60 * 5,
   
    updateAgeOnGet: true,
    updateAgeOnHas: true,
}
  
const cache = new LRUCache<string, RedisClientType<RedisDefaultModules>>(options)


export async function getClient(user: UserEntity) : Promise<RedisClientType<RedisDefaultModules>>{

    const cachedClient = cache.get(user.id)
    if (cachedClient) {
        return cachedClient
    }

    const client = user.tls ?
        await createClient({
            url: `rediss://:${ADMIN_PASSWORD}@${user.db_host}:${user.db_port}`,
            socket: {
                tls: true,
                rejectUnauthorized: false,
                ca: user?.cacert ?? ""
            }
        }).connect()
        : await createClient({
            url: `redis://:${ADMIN_PASSWORD}@${user.db_host}:${user.db_port}`
        }).connect()

    cache.set(user.id, client as RedisClientType<RedisDefaultModules>)

    return client as RedisClientType<RedisDefaultModules>
}