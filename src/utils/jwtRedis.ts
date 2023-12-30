import RedisCache from '@/config/redis';

class JwtRedis extends RedisCache {
  private redisPrefix: string = '';

  constructor(prefix: string = '') {
    super();
    this.redisPrefix = prefix;
  }

  private initKey(key: string): string {
    const my_key = `${this.redisPrefix}_${key}`;

    return my_key;
  }

  public setPrefix(prefix: string) {
    this.redisPrefix = prefix;

    return this;
  }

  async sign(jwt: string, option: { exp: number }) {
    const key = this.initKey(jwt);

    // await RedisCache.client.setEx(key, option.exp, JSON.stringify(true));
    await RedisCache.client.set(key, JSON.stringify(true), {
      EX: option.exp,
      NX: true
    });
  }

  async verify(jwt: string): Promise<boolean> {
    const key = this.initKey(jwt);

    if (await RedisCache.client.exists(key)) {
      return false;
    } else {
      return true;
    }
  }
}

export default new JwtRedis();
