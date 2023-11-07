import { RedisClientType, RedisDefaultModules, createClient } from "falkordb";
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


export async function getClient(user: UserEntity): Promise<RedisClientType<RedisDefaultModules>> {

    const userID = user.id;
    const cachedClient = cache.get(userID)
    if (cachedClient) {
        return cachedClient
    }

    const client = user.tls ?
        createClient({
            disableOfflineQueue: true,
            password: ADMIN_PASSWORD,
            socket: {
                host: user.db_ip?? "localhost",
                port: user.db_port?? 6379,
                tls: true,
                rejectUnauthorized: false,
                ca: user?.cacert ?? ""
            }
        })
        : createClient({
            disableOfflineQueue: true,
            password: ADMIN_PASSWORD,
            socket: {
                host: user.db_ip?? "localhost",
                port: user.db_port?? 6379,
            }
        })

    await client
        .on('error', err => {
            // On error remove from cache
            console.warn('Redis Client Error', err)
            let cached = cache.get(userID);
            if(cached) {
                cache.delete(userID)
                cached.quit()
            }
        })
        .connect()

    cache.set(userID, client as RedisClientType<RedisDefaultModules>)

    return client as RedisClientType<RedisDefaultModules>
}