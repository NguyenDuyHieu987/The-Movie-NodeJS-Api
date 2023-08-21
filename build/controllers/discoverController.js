"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
const redis_1 = __importDefault(require("@/config/redis"));
class DiscoverController extends redis_1.default {
    async get(req, res, next) {
        try {
            const key = req.originalUrl;
            const dataCache = await redis_1.default.client.get(key);
            if (dataCache != null) {
                return res.json(JSON.parse(dataCache));
            }
            const page = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 20;
            const sortBy = req.query?.sort_by || '';
            const primaryReleaseDateGte = req.query?.primary_release_date_gte || '';
            const primaryReleaseDateLte = req.query?.primary_release_date_lte || '';
            const withGenres = req.query?.with_genres || '';
            const withOriginalLanguage = req.query?.with_original_language || '';
            const convertReleaseDate = (date_gte, data_lte) => {
                if (date_gte != '') {
                    return {
                        release_date: {
                            $gte: date_gte,
                            $lt: data_lte,
                        },
                    };
                }
                else if (date_gte == '' && data_lte != '') {
                    return {
                        release_date: {
                            $lt: data_lte,
                        },
                    };
                }
                return {};
            };
            const convertFirstAirDate = (date_gte, data_lte) => {
                if (date_gte != '') {
                    return {
                        first_air_date: {
                            $gte: date_gte,
                            $lt: data_lte,
                        },
                    };
                }
                else if (date_gte == '' && data_lte != '') {
                    return {
                        first_air_date: {
                            $lt: data_lte,
                        },
                    };
                }
                return {};
            };
            const releaseDate = convertReleaseDate(primaryReleaseDateGte, primaryReleaseDateLte);
            const firstAirDate = convertFirstAirDate(primaryReleaseDateGte, primaryReleaseDateLte);
            const convertGenres = (genre) => {
                if (genre != '') {
                    return {
                        genres: {
                            $elemMatch: {
                                id: +withGenres,
                            },
                        },
                    };
                }
                else
                    return {};
            };
            const genres = convertGenres(withGenres);
            const convertOriginalLanguage = (language) => {
                if (language != '') {
                    return { original_language: { $regex: withOriginalLanguage } };
                }
                else
                    return {};
            };
            const originalLanguage = convertOriginalLanguage(withOriginalLanguage);
            let result = {
                page: page + 1,
                results: [],
                page_size: limit,
            };
            switch (req.params.slug) {
                case 'all':
                    switch (sortBy) {
                        case 'views_desc':
                            const movie1 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ views: -1 });
                            const tv1 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ views: -1 });
                            result.results = movie1.concat(tv1);
                            break;
                        case 'release_date_desc':
                            const movie2 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ release_date: -1 });
                            const tv2 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ first_air_date: -1 });
                            result.results = movie2.concat(tv2);
                            break;
                        case 'revenue_desc':
                            const movie3 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ revenue: -1 });
                            const tv3 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ revenue: -1 });
                            result.results = movie3.concat(tv3);
                            break;
                        case 'vote_average_desc':
                            const movie4 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_average: -1 });
                            const tv4 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_average: -1 });
                            result.results = movie4.concat(tv4);
                            break;
                        case 'vote_count_desc':
                            const movie5 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_count: -1 });
                            const tv5 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_count: -1 });
                            result.results = movie5.concat(tv5);
                            break;
                        case '':
                            const movie = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit);
                            const tv = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit);
                            result.results = movie.concat(tv);
                            break;
                        default:
                            return next(http_errors_1.default.NotFound(`Discover with sort by: ${sortBy} is not found!`));
                            break;
                    }
                    break;
                case 'movieall':
                    switch (sortBy) {
                        case 'views_desc':
                            const movie1 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ views: -1 });
                            result.results = movie1;
                            break;
                        case 'release_date_desc':
                            const movie2 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ release_date: -1 });
                            result.results = movie2;
                            break;
                        case 'revenue_desc':
                            const movie3 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ revenue: -1 });
                            result.results = movie3;
                            break;
                        case 'vote_average_desc':
                            const movie4 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_average: -1 });
                            result.results = movie4;
                            break;
                        case 'vote_count_desc':
                            const movie5 = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_count: -1 });
                            result.results = movie5;
                            break;
                        case '':
                            const movie = await movie_1.default.find({
                                $and: [releaseDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit);
                            result.results = movie;
                            break;
                        default:
                            return next(http_errors_1.default.NotFound(`Discover with sort by: ${sortBy} is not found!`));
                            break;
                    }
                    break;
                case 'tvall':
                    switch (sortBy) {
                        case 'views_desc':
                            const tv1 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ views: -1 });
                            result.results = tv1;
                            break;
                        case 'release_date_desc':
                            const tv2 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ first_air_date: -1 });
                            result.results = tv2;
                            break;
                        case 'revenue_desc':
                            const tv3 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ revenue: -1 });
                            result.results = tv3;
                            break;
                        case 'vote_average_desc':
                            const tv4 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_average: -1 });
                            result.results = tv4;
                            break;
                        case 'vote_count_desc':
                            const tv5 = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit)
                                .sort({ vote_count: -1 });
                            result.results = tv5;
                            break;
                        case '':
                            const tv = await tv_1.default.find({
                                $and: [firstAirDate, genres, originalLanguage],
                            })
                                .skip(page * limit)
                                .limit(limit);
                            result.results = tv;
                            break;
                        default:
                            return next(http_errors_1.default.NotFound(`Discover with sort by: ${sortBy} is not found!`));
                            break;
                    }
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Not found with slug: ${req.params.slug} !`));
                    break;
            }
            await redis_1.default.client.setEx(key, +process.env.REDIS_CACHE_TIME, JSON.stringify(result));
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DiscoverController();
//# sourceMappingURL=discoverController.js.map