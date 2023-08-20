"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
const redis_1 = __importDefault(require("@/config/redis"));
class RankingController extends redis_1.default {
    async get(req, res, next) {
        try {
            const page = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 20;
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            let data = [];
            let total = 0;
            switch (req.params.slug) {
                case 'day':
                    const movie1 = await movie_1.default.find()
                        .skip(0 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    const tv1 = await tv_1.default.find()
                        .skip(0 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    data = movie1.concat(tv1);
                    total = await movie_1.default.countDocuments({});
                    break;
                case 'week':
                    const movie2 = await movie_1.default.find()
                        .skip(1 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    const tv2 = await tv_1.default.find()
                        .skip(1 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    data = movie2.concat(tv2);
                    total = await movie_1.default.countDocuments({});
                    break;
                case 'month':
                    const movie3 = await movie_1.default.find()
                        .skip(2 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    const tv3 = await tv_1.default.find()
                        .skip(2 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    data = movie3.concat(tv3);
                    total = await movie_1.default.countDocuments({});
                    break;
                case 'all':
                    const movie4 = await movie_1.default.find()
                        .skip(3 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    const tv4 = await tv_1.default.find()
                        .skip(3 * (limit / 2))
                        .limit(limit / 2)
                        .sort({ views: -1 });
                    data = movie4.concat(tv4);
                    total = await movie_1.default.countDocuments({});
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Not found with slug: ${req.params.slug} !`));
                    break;
            }
            const response = {
                page: page + 1,
                results: data,
                page_size: limit,
            };
            await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(response));
            res.json(response);
        }
        catch (error) {
            next(error);
        }
        finally {
        }
    }
}
exports.default = new RankingController();
//# sourceMappingURL=rankingController.js.map