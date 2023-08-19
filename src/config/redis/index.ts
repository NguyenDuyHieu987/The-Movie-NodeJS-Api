import { RedisClientType, createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

class RedisCache {
  protected static client: RedisClientType = createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT!,
    },
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
}

export default RedisCache;