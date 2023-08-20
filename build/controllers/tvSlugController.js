"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const tvSlug_1 = __importDefault(require("@/models/tvSlug"));
const tv_1 = __importDefault(require("@/models/tv"));
const redis_1 = __importDefault(require("@/config/redis"));
class MovieSlugController extends redis_1.default {
    async get(req, res, next) {
        try {
            const page = +req.query?.page - 1 || 0;
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            let data = [];
            let total = 0;
            switch (req.params.slug) {
                case 'all':
                    data = await tv_1.default.find()
                        .skip(page * 20)
                        .limit(20);
                    total = await tv_1.default.countDocuments({});
                    break;
                case 'airingtoday':
                    data = await tvSlug_1.default.AiringToday.find()
                        .skip(page * 20)
                        .limit(20);
                    total = await tvSlug_1.default.AiringToday.countDocuments({});
                    break;
                case 'ontheair':
                    data = await tvSlug_1.default.OnTheAir.find()
                        .skip(page * 20)
                        .limit(20);
                    total = await tvSlug_1.default.OnTheAir.countDocuments({});
                    break;
                case 'popular':
                    data = await tvSlug_1.default.Popular.find()
                        .skip(page * 20)
                        .limit(20);
                    total = await tvSlug_1.default.Popular.countDocuments({});
                    break;
                case 'toprated':
                    data = await tvSlug_1.default.TopRated.find()
                        .skip(page * 20)
                        .limit(20);
                    total = await tvSlug_1.default.TopRated.countDocuments({});
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Movies with slug: ${req.params.slug} is not found!`));
                    break;
            }
            const response = {
                page: page + 1,
                results: data,
                total: total,
                page_size: 20,
            };
            await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(response));
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new MovieSlugController();
//# sourceMappingURL=tvSlugController.js.map