import dotenv from 'dotenv';
import { createClient,RedisClientType } from 'redis';
dotenv.config();

class RedisCache {
  protected static client: RedisClientType = createClient({
    // url:
    //   process.env.NODE_ENV == 'production'
    //     ? process.env.REDIS_URL
    //     : 'redis://127.0.0.1:6379',
    url: process.env.REDIS_URL,
    // username: 'default',
    // password: process.env.REDIS_PASSWORD,
    socket: {
      // host: process.env.REDIS_HOST,
      // port: +process.env.REDIS_PORT!,
      // connectTimeout: 50000,
      reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
    },
    pingInterval: 10000
  });

  constructor() {}

  redisClient(): RedisClientType {
    return RedisCache.client;
  }

  async connect() {
    await RedisCache.client.connect();
  }

  async disConnect() {
    await RedisCache.client.disconnect();
  }

  async quit() {
    await RedisCache.client.quit();
  }
}

export default RedisCache;
