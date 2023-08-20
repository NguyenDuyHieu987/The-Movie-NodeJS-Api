import RedisCache from '@/config/redis';

class JwtRedis extends RedisCache {
  private static redisPrefix: string = '';

  constructor(prefix: string = '') {
    super();
    JwtRedis.redisPrefix = prefix;
  }

  private static initKey(key: string): string {
    const my_key = `${JwtRedis.redisPrefix}_${key}`;

    return my_key;
  }

  async setPrefix(prefix: string) {
    JwtRedis.redisPrefix = prefix;
  }

  async sign(jwt: string, option: { exp: number | undefined }) {
    const key = JwtRedis.initKey(jwt);

    await RedisCache.client.setEx(key, option.exp!, 'True');
    // await RedisCache.client.set(key, 'True', { EX: option.exp, NX: true });
  }

  async verify(jwt: string): Promise<boolean> {
    const key = JwtRedis.initKey(jwt);

    if (await RedisCache.client.exists(key)) {
      return false;
    } else {
      return true;
    }
  }
}

export default new JwtRedis();
