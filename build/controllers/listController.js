"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const list_1 = __importDefault(require("@/models/list"));
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
class ListController {
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
                    data = await list_1.default.find({
                        user_id: user.id,
                    })
                        .skip(skip * limit)
                        .limit(limit)
                        .sort({ created_at: -1 });
                    total = await list_1.default.countDocuments({
                        user_id: user.id,
                    });
                    break;
                case 'movie':
                    data = await list_1.default.find({
                        user_id: user.id,
                        media_type: 'movie',
                    })
                        .skip(skip * limit)
                        .limit(limit)
                        .sort({ created_at: -1 });
                    total = await list_1.default.countDocuments({
                        user_id: user.id,
                        media_type: 'movie',
                    });
                    break;
                case 'tv':
                    data = await list_1.default.find({
                        user_id: user.id,
                        media_type: 'tv',
                    })
                        .skip(skip * limit)
                        .limit(limit)
                        .sort({ created_at: -1 });
                    total = await list_1.default.countDocuments({
                        user_id: user.id,
                        media_type: 'tv',
                    });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`List with slug: ${req.params.slug} is not found!`));
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
                    data = await list_1.default.find({
                        user_id: user.id,
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    }).sort({ created_at: -1 });
                    break;
                case 'movie':
                    data = await list_1.default.find({
                        user_id: user.id,
                        media_type: 'movie',
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    }).sort({ created_at: -1 });
                    break;
                case 'tv':
                    data = await list_1.default.find({
                        user_id: user.id,
                        media_type: 'tv',
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    }).sort({ created_at: -1 });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`List with slug: ${req.params.slug} is not found!`));
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
            const data = await list_1.default.findOne({
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
                    result: 'Failed to get item in list',
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
            const idItemList = (0, uuid_1.v4)();
            switch (mediaType) {
                case 'movie':
                    const movie = await movie_1.default.findOne({ id: movieId });
                    if (movie != null) {
                        const itemList = await list_1.default.findOne({
                            user_id: user.id,
                            movie_id: movieId,
                            media_type: 'movie',
                        });
                        if (itemList == null) {
                            list_1.default.create({
                                id: idItemList,
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
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            });
                            res.json({
                                success: true,
                                results: 'Add item to list suucessfully',
                            });
                        }
                        else {
                            next(http_errors_1.default.InternalServerError('Movie is already exist in list'));
                        }
                    }
                    else {
                        next(http_errors_1.default.NotFound('Movie is not exists'));
                    }
                    break;
                case 'tv':
                    const tv = await tv_1.default.findOne({ id: movieId });
                    if (tv != null) {
                        const itemList = await list_1.default.findOne({
                            user_id: user.id,
                            movie_id: movieId,
                            media_type: 'tv',
                        });
                        if (itemList == null) {
                            list_1.default.create({
                                id: idItemList,
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
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            });
                            res.json({
                                success: true,
                                results: 'Add item to list suucessfully',
                            });
                        }
                        else {
                            next(http_errors_1.default.InternalServerError('Movie is already exist in list'));
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
            const result = await list_1.default.deleteOne({
                user_id: user.id,
                movie_id: movieId,
                media_type: mediaType,
            });
            if (result.deletedCount == 1) {
                res.json({
                    success: true,
                    results: 'Remove item from list suucessfully',
                });
            }
            else {
                next(http_errors_1.default.InternalServerError('Delete movie from list failed'));
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
            const result = await list_1.default.deleteMany({
                user_id: user.id,
            });
            if (result.deletedCount >= 1) {
                const list = await list_1.default.find({ user_id: user.id });
                res.json({
                    success: true,
                    results: list,
                });
            }
            else {
                next(http_errors_1.default.InternalServerError('Delete all movie from list failed'));
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ListController();
//# sourceMappingURL=listController.js.map