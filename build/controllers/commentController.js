"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const uuid_1 = require("uuid");
const comment_1 = __importDefault(require("@/models/comment"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
class CommentController {
    async getParent(req, res, next) {
        try {
            const skip = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 20;
            const movieId = req.params.movieId;
            const movieType = req.params.movieType;
            const comment = await comment_1.default.find({
                movie_id: movieId,
                movie_type: movieType,
                type: 'parent',
            })
                .sort({ created_at: -1 })
                .skip(skip * limit)
                .limit(limit);
            const total = await comment_1.default.countDocuments({
                movie_id: movieId,
                movie_type: movieType,
            });
            res.json({ results: comment, total: total });
        }
        catch (error) {
            next(error);
        }
    }
    async getChild(req, res, next) {
        try {
            const skip = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 20;
            const movieId = req.params.movieId;
            const movieType = req.params.movieType;
            const parentId = req.params.parentId;
            const comment = await comment_1.default.find({
                movie_id: movieId,
                parent_id: parentId,
                movie_type: movieType,
                type: 'children',
            })
                .sort({ created_at: -1 })
                .skip(skip * limit)
                .limit(limit);
            res.json({ results: comment });
        }
        catch (error) {
            next(error);
        }
    }
    async post(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const movieId = req.params.movieId;
            const movieType = req.params.movieType;
            let isExistMovies = false;
            switch (movieType) {
                case 'movie':
                    isExistMovies = (await movie_1.default.findOne({ id: movieId })) != null;
                    break;
                case 'tv':
                    isExistMovies = (await tv_1.default.findOne({ id: movieId })) != null;
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Movie with type: ${movieType} is not found`));
                    break;
            }
            if (isExistMovies) {
                const commentForm = req.body;
                if (commentForm.content.length == 0) {
                    return next(http_errors_1.default.NotFound('Content comment is not allowed empty'));
                }
                const idComment = (0, uuid_1.v4)();
                let result = null;
                if (Object.hasOwnProperty.bind(commentForm)('parent_id')) {
                    if (commentForm.parent_id != undefined &&
                        commentForm.parent_id != null) {
                        result = await comment_1.default.create({
                            id: idComment,
                            content: commentForm.content,
                            user_id: user.id,
                            username: user.username,
                            user_avatar: user.avatar,
                            movie_id: movieId,
                            movie_type: movieType,
                            parent_id: commentForm.parent_id,
                            type: 'children',
                            childrens: 0,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });
                        if (result != null) {
                            await comment_1.default.updateOne({
                                id: commentForm.parent_id,
                                movie_id: movieId,
                                movie_type: movieType,
                                type: 'parent',
                            }, {
                                $inc: { childrens: 1 },
                            });
                        }
                    }
                }
                else {
                    result = await comment_1.default.create({
                        id: idComment,
                        content: commentForm.content,
                        user_id: user.id,
                        username: user.username,
                        user_avatar: user.avatar,
                        movie_id: movieId,
                        movie_type: movieType,
                        parent_id: null,
                        type: commentForm?.type || 'parent',
                        childrens: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
                }
                if (result != null) {
                    return res.json({
                        success: true,
                        result: {
                            id: idComment,
                            content: commentForm.content,
                            user_id: user.id,
                            username: user.username,
                            user_avatar: user.avatar,
                            movie_id: movieId,
                            movie_type: movieType,
                            parent_id: commentForm?.parent_id || null,
                            type: commentForm?.type || 'parent',
                            childrens: 0,
                            created_at: result.created_at,
                            updated_at: result.updated_at,
                        },
                    });
                }
                else {
                    return next(http_errors_1.default.InternalServerError('Post comment failed'));
                }
            }
            else {
                return next(http_errors_1.default.NotFound('Movie is not exists'));
            }
        }
        catch (error) {
            next(error);
        }
    }
    async edit(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const movieId = req.params.movieId;
            const movieType = req.params.movieType;
            let isExistMovies = false;
            switch (movieType) {
                case 'movie':
                    isExistMovies = (await movie_1.default.findOne({ id: movieId })) != null;
                    break;
                case 'tv':
                    isExistMovies = (await tv_1.default.findOne({ id: movieId })) != null;
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Movie with type: ${movieType} is not found`));
                    break;
            }
            if (isExistMovies) {
                const commentForm = req.body;
                const result = await comment_1.default.updateOne({
                    id: commentForm.id,
                    user_id: user.id,
                    movie_id: movieId,
                    movie_type: movieType,
                }, {
                    $set: {
                        content: commentForm['content'],
                        updated: true,
                        updated_at: new Date().toISOString(),
                    },
                });
                if (result.matchedCount == 1) {
                    return res.json({ success: true, content: commentForm.content });
                }
                else {
                    return next(http_errors_1.default.InternalServerError('Update comment failed'));
                }
            }
            else {
                return next(http_errors_1.default.NotFound('Movie is not exists'));
            }
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const user_token = req.headers.authorization.replace('Bearer ', '');
            const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET, {
                algorithms: ['HS256'],
            });
            const movieId = req.params.movieId;
            const movieType = req.params.movieType;
            let isExistMovies = false;
            switch (movieType) {
                case 'movie':
                    isExistMovies = (await movie_1.default.findOne({ id: movieId })) != null;
                    break;
                case 'tv':
                    isExistMovies = (await tv_1.default.findOne({ id: movieId })) != null;
                    break;
                default:
                    return next(http_errors_1.default.NotFound(`Movie with type: ${movieType} is not found`));
                    break;
            }
            if (isExistMovies) {
                const commentForm = req.body;
                if (commentForm.type == 'parent') {
                    const result1 = await comment_1.default.deleteOne({
                        id: commentForm.id,
                        user_id: user.id,
                        movie_id: movieId,
                        movie_type: movieType,
                        parent_id: null,
                        type: 'parent',
                    });
                    const childrens = await comment_1.default.find({
                        movie_id: movieId,
                        movie_type: movieType,
                        parent_id: commentForm.id,
                        type: 'children',
                    });
                    if (childrens.length > 0) {
                        const result2 = await comment_1.default.deleteMany({
                            movie_id: movieId,
                            movie_type: movieType,
                            parent_id: commentForm.id,
                            type: 'children',
                        });
                        if (result1.deletedCount == 1 && result2.deletedCount >= 1) {
                            return res.json({
                                success: true,
                            });
                        }
                        else {
                            return next(http_errors_1.default.InternalServerError('Delete comment failed'));
                        }
                    }
                    else if (childrens.length == 0) {
                        if (result1.deletedCount == 1) {
                            return res.json({
                                success: true,
                            });
                        }
                        else {
                            return next(http_errors_1.default.InternalServerError('Delete comment failed'));
                        }
                    }
                }
                else if (commentForm.type == 'children') {
                    const result1 = await comment_1.default.deleteOne({
                        id: commentForm.id,
                        user_id: user.id,
                        movie_id: movieId,
                        movie_type: movieType,
                        parent_id: commentForm?.parent_id || null,
                        type: 'children',
                    });
                    const result2 = await comment_1.default.updateOne({
                        id: commentForm.parent_id,
                        movie_id: movieId,
                        movie_type: movieType,
                        type: 'parent',
                    }, {
                        $inc: { childrens: -1 },
                    });
                    if (result1.deletedCount == 1 && result2.modifiedCount == 1) {
                        return res.json({
                            success: true,
                        });
                    }
                    else {
                        return next(http_errors_1.default.InternalServerError('Delete comment failed'));
                    }
                }
            }
            else {
                return http_errors_1.default.NotFound('Movie is not exists');
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new CommentController();
//# sourceMappingURL=commentController.js.map