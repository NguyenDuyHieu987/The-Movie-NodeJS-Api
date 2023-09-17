"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
class UpdateViewController {
    async update(req, res, next) {
        try {
            const movieId = req.params.movieId;
            const movieType = req.params.movieType;
            let isUpdate = false;
            switch (movieType) {
                case 'movie':
                    const movie = await movie_1.default.updateOne({ id: movieId }, {
                        $inc: { views: 1 },
                    });
                    isUpdate = movie.modifiedCount == 1;
                    break;
                case 'tv':
                    const tv = await tv_1.default.updateOne({ id: movieId }, {
                        $inc: { views: 1 },
                    });
                    isUpdate = tv.modifiedCount == 1;
                default:
                    return next(http_errors_1.default.NotFound(`Movie with type: ${movieType} is not found`));
                    break;
            }
            if (isUpdate) {
                return res.json({
                    success: false,
                    result: 'Update views movie failed',
                });
            }
            else {
                return res.json({
                    success: true,
                    result: 'Update views movie successfully',
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UpdateViewController();
//# sourceMappingURL=updateViewContronllers.js.map