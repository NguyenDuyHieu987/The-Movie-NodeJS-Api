"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const movie_1 = __importDefault(require("@/models/movie"));
const image_1 = __importDefault(require("@/models/image"));
const video_1 = __importDefault(require("@/models/video"));
const credit_1 = __importDefault(require("@/models/credit"));
class MovieController {
    async get(req, res, next) {
        try {
            const data = await movie_1.default.findOne({
                id: req.params.id,
            });
            let append_to_response = null;
            let extraValue = {};
            if (req.query?.append_to_response) {
                append_to_response = req.query.append_to_response.split(',');
                if (append_to_response.includes('images')) {
                    const images = await image_1.default.findOne({
                        id: req.params.id,
                    });
                    extraValue.images = images?.items;
                }
                if (append_to_response.includes('videos')) {
                    const videos = await video_1.default.findOne({
                        id: req.params.id,
                    });
                    extraValue.videos = videos?.items;
                }
                if (append_to_response.includes('credits')) {
                    const credits = await credit_1.default.findOne({
                        id: req.params.id,
                    });
                    extraValue.credits = credits?.items;
                }
            }
            res.json({ ...data?.toObject(), ...extraValue });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new MovieController();
//# sourceMappingURL=movieController.js.map