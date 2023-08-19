import RedisCache from '@/config/redis';

class JwtRedis extends RedisCache {
  private static redisPrefix: string = '';

  constructor(prefix: string = '') {
    super();
    JwtRedis.redisPrefix = prefix;
    this.connect();
  }

  private static initKey(key: string): string {
    const my_key = `${JwtRedis.redisPrefix}_${key}`;

    return my_key;
  }

  sign(jwt: string, option: { exp: number | undefined }) {
    const key = JwtRedis.initKey(jwt);

    this.RedisCache().set(key, 'True', { EX: option.exp, NX: true });

    this.connect();
  }

  async verify(jwt: string): Promise<boolean> {
    const key = JwtRedis.initKey(jwt);

    if (await this.RedisCache().exists(key)) {
      return true;
    } else {
      return false;
    }
  }
}

export default new JwtRedis();
