"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const uuid_1 = require("uuid");
const rate_1 = __importDefault(require("@/models/rate"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
class RatingController {
    async get(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const mediaType = req.params.movieType;
            const movieId = req.params.movieId;
            const rate = await rate_1.default.findOne({
                user_id: user.id,
                movie_id: movieId,
                movie_type: mediaType,
            });
            if (rate != null) {
                res.json({ success: true, result: rate });
            }
            else {
                next(http_errors_1.default.NotFound(`Rate is not exist`));
            }
        }
        catch (error) {
            next(error);
        }
    }
    async rate(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const mediaType = req.params.movieType;
            const movieId = req.params.movieId;
            const rateValue = req.body.value;
            switch (mediaType) {
                case 'movie':
                    const movie = await movie_1.default.findOne({ id: movieId });
                    if (movie != null) {
                        const voteAverage = (movie.vote_count * movie.vote_average + rateValue) /
                            (movie.vote_count + 1);
                        const movieUpdated = await movie_1.default.findByIdAndUpdate({ id: movieId }, {
                            $set: {
                                vote_average: voteAverage,
                                vote_count: movie.vote_count + 1,
                            },
                        }, { returnDocument: 'after' });
                        const idRate = (0, uuid_1.v4)();
                        const result = await rate_1.default.create({
                            id: idRate,
                            rate_value: rateValue,
                            user_id: user.id,
                            movie_id: movieId,
                            movie_type: 'movie',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });
                        if (result != null) {
                            res.json({
                                success: true,
                                vote_average: movieUpdated.vote_average,
                                vote_count: movieUpdated.vote_count,
                            });
                        }
                        else {
                            next(http_errors_1.default.InternalServerError(`Rate movie failed`));
                        }
                    }
                    else {
                        next(http_errors_1.default.NotFound(`Movie is not exist`));
                    }
                    break;
                case 'tv':
                    const tv = await tv_1.default.findOne({ id: movieId });
                    if (tv != null) {
                        const voteAverage = (tv.vote_count * tv.vote_average + rateValue) /
                            (tv.vote_count + 1);
                        const movieUpdated = await tv_1.default.findByIdAndUpdate({ id: movieId }, {
                            $set: {
                                vote_average: voteAverage,
                                vote_count: tv.vote_count + 1,
                            },
                        }, { returnDocument: 'after' });
                        const idRate = (0, uuid_1.v4)();
                        const result = await rate_1.default.create({
                            id: idRate,
                            rate_value: rateValue,
                            user_id: user.id,
                            movie_id: movieId,
                            movie_type: 'tv',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });
                        if (result != null) {
                            res.json({
                                success: true,
                                vote_average: movieUpdated.vote_average,
                                vote_count: movieUpdated.vote_count,
                            });
                        }
                        else {
                            next(http_errors_1.default.InternalServerError(`Rate movie failed`));
                        }
                    }
                    else {
                        next(http_errors_1.default.NotFound(`Movie is not exist`));
                    }
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Movie with type: ${mediaType} is not found`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new RatingController();
//# sourceMappingURL=ratingController.js.map