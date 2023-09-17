"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const history_1 = __importDefault(require("@/models/history"));
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
class HistoryController {
    async get(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const skip = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 20;
            let data = [];
            let total = 0;
            switch (req.params.slug) {
                case 'all':
                    data = await history_1.default.find({
                        user_id: user.id,
                    })
                        .skip(skip * limit)
                        .limit(limit)
                        .sort({ created_at: -1 });
                    total = await history_1.default.countDocuments({
                        user_id: user.id,
                    });
                    break;
                case 'movie':
                    data = await history_1.default.find({
                        user_id: user.id,
                        media_type: 'movie',
                    })
                        .skip(skip * limit)
                        .limit(limit)
                        .sort({ created_at: -1 });
                    total = await history_1.default.countDocuments({
                        user_id: user.id,
                        media_type: 'movie',
                    });
                    break;
                case 'tv':
                    data = await history_1.default.find({
                        user_id: user.id,
                        media_type: 'tv',
                    })
                        .skip(skip * limit)
                        .limit(limit)
                        .sort({ created_at: -1 });
                    total = await history_1.default.countDocuments({
                        user_id: user.id,
                        media_type: 'tv',
                    });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`History with slug: ${req.params.slug} is not found!`));
                    break;
            }
            return res.json({
                results: data,
                total: total,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const query = req.query?.query || '';
            let data = [];
            switch (req.params.slug) {
                case 'all':
                    data = await history_1.default.find({
                        user_id: user.id,
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    }).sort({ created_at: -1 });
                    break;
                case 'movie':
                    data = await history_1.default.find({
                        user_id: user.id,
                        media_type: 'movie',
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    }).sort({ created_at: -1 });
                    break;
                case 'tv':
                    data = await history_1.default.find({
                        user_id: user.id,
                        media_type: 'tv',
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    }).sort({ created_at: -1 });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`History with slug: ${req.params.slug} is not found!`));
                    break;
            }
            return res.json({
                results: data,
                total: data.length,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getItem(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const data = await history_1.default.findOne({
                user_id: user.id,
                movie_id: req.params.movieId,
                media_type: req.params.type,
            });
            if (data != null) {
                return res.json({ success: true, result: data });
            }
            else {
                return res.json({
                    success: false,
                    result: 'Failed to get item in History',
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async addItem(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const movieId = req.body.movie_id;
            const mediaType = req.body.media_type;
            const idItemHistory = (0, uuid_1.v4)();
            const duration = req.body.duration;
            const percent = req.body.percent;
            const seconds = req.body.seconds;
            switch (mediaType) {
                case 'movie':
                    const movie = await movie_1.default.findOne({ id: movieId });
                    if (movie != null) {
                        const itemHistory = await history_1.default.findOne({
                            user_id: user.id,
                            movie_id: movieId,
                            media_type: 'movie',
                        });
                        if (itemHistory == null) {
                            history_1.default.create({
                                id: idItemHistory,
                                user_id: user.id,
                                movie_id: movieId,
                                name: movie.name,
                                original_name: movie.original_name,
                                original_language: movie.original_language,
                                media_type: 'movie',
                                genres: movie.genres,
                                backdrop_path: movie.backdrop_path,
                                poster_path: movie.poster_path,
                                dominant_backdrop_color: movie.dominant_backdrop_color,
                                dominant_poster_color: movie.dominant_poster_color,
                                duration: duration,
                                percent: percent,
                                seconds: seconds,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            });
                            res.json({
                                success: true,
                                results: 'Add item to history suucessfully',
                            });
                        }
                        else {
                            const oldDuration = itemHistory.duration;
                            const oldSeconds = itemHistory.seconds;
                            const oldPercent = itemHistory.percent;
                            if (seconds > oldSeconds && percent > oldPercent) {
                                history_1.default.updateOne({
                                    user_id: user.id,
                                    movie_id: movieId,
                                    media_type: 'movie',
                                }, {
                                    $set: {
                                        duration: duration,
                                        percent: percent,
                                        seconds: seconds,
                                        updated_at: new Date().toISOString(),
                                    },
                                });
                            }
                            else {
                                history_1.default.updateOne({
                                    user_id: user.id,
                                    movie_id: movieId,
                                    media_type: 'movie',
                                }, {
                                    $set: {
                                        duration: duration,
                                        percent: percent,
                                        seconds: seconds,
                                        updated_at: new Date().toISOString(),
                                    },
                                });
                            }
                            res.json({
                                success: true,
                                results: 'Add item to history suucessfully',
                            });
                        }
                    }
                    else {
                        next(http_errors_1.default.NotFound('Movie is not exists'));
                    }
                    break;
                case 'tv':
                    const tv = await tv_1.default.findOne({ id: movieId });
                    if (tv != null) {
                        const itemHistory = await history_1.default.findOne({
                            user_id: user.id,
                            movie_id: movieId,
                            media_type: 'tv',
                        });
                        if (itemHistory == null) {
                            history_1.default.create({
                                id: idItemHistory,
                                user_id: user.id,
                                movie_id: movieId,
                                name: tv.name,
                                original_name: tv.original_name,
                                original_language: tv.original_language,
                                media_type: 'tv',
                                genres: tv.genres,
                                backdrop_path: tv.backdrop_path,
                                poster_path: tv.poster_path,
                                dominant_backdrop_color: tv.dominant_backdrop_color,
                                dominant_poster_color: tv.dominant_poster_color,
                                duration: duration,
                                percent: percent,
                                seconds: seconds,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            });
                            res.json({
                                success: true,
                                results: 'Add item to history suucessfully',
                            });
                        }
                        else {
                            const oldDuration = itemHistory.duration;
                            const oldSeconds = itemHistory.seconds;
                            const oldPercent = itemHistory.percent;
                            if (seconds > oldSeconds && percent > oldPercent) {
                                history_1.default.updateOne({
                                    user_id: user.id,
                                    movie_id: movieId,
                                    media_type: 'tv',
                                }, {
                                    $set: {
                                        duration: duration,
                                        percent: percent,
                                        seconds: seconds,
                                        updated_at: new Date().toISOString(),
                                    },
                                });
                            }
                            else {
                                history_1.default.updateOne({
                                    user_id: user.id,
                                    movie_id: movieId,
                                    media_type: 'tv',
                                }, {
                                    $set: {
                                        duration: duration,
                                        percent: percent,
                                        seconds: seconds,
                                        updated_at: new Date().toISOString(),
                                    },
                                });
                            }
                            res.json({
                                success: true,
                                results: 'Add item to history suucessfully',
                            });
                        }
                    }
                    else {
                        next(http_errors_1.default.NotFound('Movie is not exists'));
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
    async removeItem(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const id = req.body?.id || null;
            const movieId = req.body.movie_id;
            const mediaType = req.body.media_type;
            const result = await history_1.default.deleteOne({
                user_id: user.id,
                movie_id: movieId,
                media_type: mediaType,
            });
            if (result.deletedCount == 1) {
                res.json({
                    success: true,
                    results: 'Remove item from history suucessfully',
                });
            }
            else {
                next(http_errors_1.default.InternalServerError('Delete movie from history failed'));
            }
        }
        catch (error) {
            next(error);
        }
    }
    async removeAllItem(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const result = await history_1.default.deleteMany({
                user_id: user.id,
            });
            if (result.deletedCount >= 1) {
                const history = await history_1.default.find({ user_id: user.id });
                res.json({
                    success: true,
                    results: history,
                });
            }
            else {
                next(http_errors_1.default.InternalServerError('Delete all movie from history failed'));
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new HistoryController();
//# sourceMappingURL=historyController.js.map