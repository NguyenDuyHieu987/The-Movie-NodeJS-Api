"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const trending_1 = __importDefault(require("@/models/trending"));
const redis_1 = __importDefault(require("@/config/redis"));
class TrendingController extends redis_1.default {
    constructor() {
        super();
    }
    async get(req, res, next) {
        try {
            const page = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 20;
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            switch (req.params.slug) {
                case 'all':
                    const trending = await trending_1.default.find()
                        .skip(page * limit)
                        .limit(limit);
                    const total = await trending_1.default.countDocuments({});
                    const response = {
                        page: page + 1,
                        results: trending,
                        total: total,
                        page_size: limit,
                    };
                    await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(response));
                    res.json(response);
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Not found with slug: ${req.params.slug} !`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
        finally {
        }
    }
}
exports.default = new TrendingController();
//# sourceMappingURL=trendingController.js.map