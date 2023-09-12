import { RedisClientType, createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

class RedisCache {
  protected static client: RedisClientType = createClient({
    url:
      process.env.NODE_ENV == 'production'
        ? process.env.REDIS_URL
        : 'redis://127.0.0.1:6379',
    // username: 'default',
    // password: process.env.REDIS_PASSWORD,
    // socket: {
    //   host:
    //     process.env.NODE_ENV == 'production'
    //       ? process.env.REDIS_HOST
    //       : '127.0.0.1',
    //   port:
    //     process.env.NODE_ENV == 'production' ? +process.env.REDIS_PORT! : 6379,
    //   connectTimeout: 50000,
    // },
    pingInterval: 1000,
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
