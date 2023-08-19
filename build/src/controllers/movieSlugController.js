"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const movieSlug_1 = __importDefault(require("@/models/movieSlug"));
const movie_1 = __importDefault(require("@/models/movie"));
class MovieSlugController {
    async get(req, res, next) {
        try {
            const page = +req.query?.page - 1 || 0;
            switch (req.params.slug) {
                case 'all':
                    const data = await movie_1.default.find()
                        .skip(page * 20)
                        .limit(20);
                    const total = await movie_1.default.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: data,
                        total: total,
                        page_size: 20,
                    });
                    break;
                case 'nowplaying':
                    const nowplaying = await movieSlug_1.default.NowPlaying.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalNowPlaying = await movieSlug_1.default.NowPlaying.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: nowplaying,
                        total: totalNowPlaying,
                        page_size: 20,
                    });
                    break;
                case 'upcoming':
                    const upcoming = await movieSlug_1.default.UpComing.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalUpComing = await movieSlug_1.default.UpComing.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: upcoming,
                        total: totalUpComing,
                        page_size: 20,
                    });
                    break;
                case 'popular':
                    const popular = await movieSlug_1.default.Popular.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalPopular = await movieSlug_1.default.Popular.countDocuments({});
                    res.json({
                        page: page + 1,
                        results: popular,
                        total: totalPopular,
                        page_size: 20,
                    });
                    break;
                case 'toprated':
                    const toprated = await movieSlug_1.default.TopRated.find()
                        .skip(page * 20)
                        .limit(20);
                    const totalTopRated = await movieSlug_1.default.TopRated.countDocuments({});
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
//# sourceMappingURL=movieSlugController.js.map