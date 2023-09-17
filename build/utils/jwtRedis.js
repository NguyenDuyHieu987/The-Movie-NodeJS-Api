"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("@/config/redis"));
class JwtRedis extends redis_1.default {
    static redisPrefix = '';
    constructor(prefix = '') {
        super();
        JwtRedis.redisPrefix = prefix;
    }
    static initKey(key) {
        const my_key = `${JwtRedis.redisPrefix}_${key}`;
        return my_key;
    }
    async setPrefix(prefix) {
        JwtRedis.redisPrefix = prefix;
    }
    async sign(jwt, option) {
        const key = JwtRedis.initKey(jwt);
        await redis_1.default.client.setEx(key, option.exp, 'True');
        // await RedisCache.client.set(key, 'True', { EX: option.exp, NX: true });
    }
    async verify(jwt) {
        const key = JwtRedis.initKey(jwt);
        if (await redis_1.default.client.exists(key)) {
            return false;
        }
        else {
            return true;
        }
    }
}
exports.default = new JwtRedis();
//# sourceMappingURL=jwtRedis.js.map