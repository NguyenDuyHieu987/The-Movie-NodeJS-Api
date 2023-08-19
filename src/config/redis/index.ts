import { RedisClientType, createClient } from 'redis';

class RedisCache {
  private static client: RedisClientType = createClient({
    url: process.env.REDIS_URL!,
  });

  constructor() {}

  RedisCache(): RedisClientType {
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
