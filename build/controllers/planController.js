"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const plan_1 = __importDefault(require("@/models/plan"));
const redis_1 = __importDefault(require("@/config/redis"));
class PlanController extends redis_1.default {
    async get(req, res, next) {
        try {
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            const data = await plan_1.default.find().sort({ order: 1 });
            if (data != null) {
                const response = { results: data };
                await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(response));
                res.json(response);
            }
            else {
                next(http_errors_1.default.NotFound(`Plan is not exist`));
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new PlanController();
//# sourceMappingURL=planController.js.map