"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const image_1 = __importDefault(require("@/models/image"));
const redis_1 = __importDefault(require("@/config/redis"));
class ImageController extends redis_1.default {
    async get(req, res, next) {
        try {
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            const data = await image_1.default.findOne({ id: req.params.id });
            await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(data));
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ImageController();
//# sourceMappingURL=imageController.js.map