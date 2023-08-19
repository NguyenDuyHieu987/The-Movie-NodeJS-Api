"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const tvSlug_1 = __importDefault(require("@/models/tvSlug"));
const tv_1 = __importDefault(require("@/models/tv"));
class MovieSlugController {
    async get(req, res, next) {
        try {
            const page = +req.query?.page - 1 || 0;
            switch (req.params.slug) {
                case 'all':
                    const data = await tv_1.default.find()
                        .skip(page * 20)
                        .limit(20);
                    const total = await tv_1.default.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: data,
                        total: total,
                        page_size: 20,
                    });
                    break;
                case 'airingtoday':
                    const airingtoday = await tvSlug_1.default.AiringToday.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalAiringToday = await tvSlug_1.default.AiringToday.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: airingtoday,
                        total: totalAiringToday,
                        page_size: 20,
                    });
                    break;
                case 'ontheair':
                    const ontheair = await tvSlug_1.default.OnTheAir.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalOnTheAir = await tvSlug_1.default.OnTheAir.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: ontheair,
                        total: totalOnTheAir,
                        page_size: 20,
                    });
                    break;
                case 'popular':
                    const popular = await tvSlug_1.default.Popular.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalPopular = await tvSlug_1.default.Popular.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: popular,
                        total: totalPopular,
                        page_size: 20,
                    });
                    break;
                case 'toprated':
                    const toprated = await tvSlug_1.default.TopRated.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalTopRated = await tvSlug_1.default.TopRated.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: toprated,
                        total: totalTopRated,
                        page_size: 20,
                    });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Movies with slug: ${req.params.slug} is not found!`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new MovieSlugController();
//# sourceMappingURL=tvSlugController.js.map