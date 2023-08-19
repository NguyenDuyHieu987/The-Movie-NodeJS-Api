"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const movie_1 = __importDefault(require("@/models/movie"));
const image_1 = __importDefault(require("@/models/image"));
const video_1 = __importDefault(require("@/models/video"));
const credit_1 = __importDefault(require("@/models/credit"));
const list_1 = __importDefault(require("@/models/list"));
const history_1 = __importDefault(require("@/models/history"));
const http_errors_1 = __importDefault(require("http-errors"));
class MovieController {
    async get(req, res, next) {
        try {
            const data = await movie_1.default.findOne({
                id: req.params.id,
            });
            if (data == null) {
                return next(http_errors_1.default.NotFound(`Movie with id: ${req.params.id} is not found`));
            }
            let append_to_response = null;
            let extraValue = {};
            if (req.query?.append_to_response) {
                append_to_response = req.query.append_to_response.split(',');
                if (append_to_response.includes('images')) {
                    const images = await image_1.default.findOne({
                        id: req.params.id,
                    });
                    extraValue.images = images.items;
                }
                if (append_to_response.includes('videos')) {
                    const videos = await video_1.default.findOne({
                        id: req.params.id,
                    });
                    extraValue.videos = videos.items;
                }
                if (append_to_response.includes('credits')) {
                    const credits = await credit_1.default.findOne({
                        id: req.params.id,
                    });
                    extraValue.credits = credits.items;
                }
            }
            if (req.headers?.authorization) {
                const user_token = req.headers.authorization.replace('Bearer ', '');
                const user = jsonwebtoken_1.default.verify(user_token, process.env.JWT_SIGNATURE_SECRET);
                const item_list = await list_1.default.findOne({
                    user_id: user.id,
                    movie_id: req.params.id,
                    media_type: 'movie',
                });
                const item_history = await history_1.default.findOne({
                    user_id: user.id,
                    movie_id: req.params.id,
                    media_type: 'movie',
                });
                if (item_history != null) {
                    return res.json({
                        ...data?.toObject(),
                        ...extraValue,
                        ...{
                            in_list: item_list != null,
                            in_history: true,
                            history_progress: {
                                duration: item_history.duration,
                                percent: item_history.percent,
                                seconds: item_history.seconds,
                            },
                        },
                    });
                }
                else {
                    return res.json({
                        ...data?.toObject(),
                        ...extraValue,
                        ...{
                            in_list: item_list != null,
                            in_history: false,
                        },
                    });
                }
            }
            return res.json({ ...data?.toObject(), ...extraValue });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new MovieController();
//# sourceMappingURL=movieController.js.map