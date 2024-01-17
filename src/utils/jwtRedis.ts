import type { SetOptions } from 'redis';

import { RedisCache } from '@/config/redis';

export const REVOKE_TOKEN_PREFIX = 'revoke__';

export class JwtRedis extends RedisCache {
  private redisPrefix: string = '';

  constructor(prefix: string = '') {
    super();
    this.redisPrefix = prefix;
  }

  private initKey(key: string): string {
    const my_key = `${this.redisPrefix}__${key}`;

    return my_key;
  }

  public setPrefix(prefix: string) {
    this.redisPrefix = prefix;

    return this;
  }

  public setRevokePrefix(prefix: string) {
    this.redisPrefix = REVOKE_TOKEN_PREFIX + prefix;

    return this;
  }

  async sign(jwt: string, options: SetOptions) {
    const key = this.initKey(jwt);

    options.NX = true;

    await RedisCache.client.set(key, JSON.stringify(true), {
      // EX: options.exp,
      // NX: true,
      ...options
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
