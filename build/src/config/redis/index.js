"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RedisCache {
    static client = (0, redis_1.createClient)({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
        },
    });
    constructor() { }
    redisClient() {
        return RedisCache.client;
    }
    async connect() {
        await RedisCache.client.connect();
    }
    async disConnect() {
        await RedisCache.client.disconnect();
    }
}
exports.default = RedisCache;
//# sourceMappingURL=index.js.map