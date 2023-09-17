"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
const redis_1 = __importDefault(require("@/config/redis"));
class SimilarController extends redis_1.default {
    constructor() {
        super();
    }
    async get(req, res, next) {
        try {
            const mediaType = req.params.type;
            const movieId = req.params.movieId;
            const page = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 12;
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            let similar = [];
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            switch (mediaType) {
                case 'movie':
                    const movie = await movie_1.default.findOne({ id: movieId });
                    if (movie != null) {
                        const genre = movie.genres;
                        const country = movie.original_language;
                        similar = await movie_1.default.find({
                            id: {
                                $nin: [movieId],
                            },
                            $or: [
                                { original_language: { $regex: country } },
                                {
                                    genres: {
                                        $elemMatch: { $or: [...genre] },
                                    },
                                },
                            ],
                        })
                            .skip(page * limit)
                            .limit(limit)
                            .sort({ views: -1 });
                    }
                    else {
                        return next(http_errors_1.default.NotFound(`Movie is not exist`));
                    }
                    break;
                case 'tv':
                    const tv = await tv_1.default.findOne({ id: movieId });
                    if (tv != null) {
                        const genre = tv.genres;
                        const country = tv.original_language;
                        similar = await tv_1.default.find({
                            id: {
                                $nin: [movieId],
                            },
                            $or: [
                                { original_language: { $regex: country } },
                                {
                                    genres: {
                                        $elemMatch: { $or: [...genre] },
                                    },
                                },
                            ],
                        })
                            .skip(page * limit)
                            .limit(limit)
                            .sort({ views: -1 });
                    }
                    else {
                        return next(http_errors_1.default.NotFound(`Movie is not exist`));
                    }
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Movie with type: ${mediaType} is not found`));
                    break;
            }
            const response = {
                page: page + 1,
                results: similar,
                page_size: limit,
            };
            await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(response));
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SimilarController();
//# sourceMappingURL=similarController.js.map