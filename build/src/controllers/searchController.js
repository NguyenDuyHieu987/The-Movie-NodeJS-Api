"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const movie_1 = __importDefault(require("@/models/movie"));
const tv_1 = __importDefault(require("@/models/tv"));
class SearchController {
    async search(req, res, next) {
        try {
            const query = req.query.query || '';
            const page = +req.query?.page - 1 || 0;
            switch (req.params.type) {
                case 'all':
                    const movie = await movie_1.default.find({
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    })
                        .skip(page * 10)
                        .limit(10)
                        .sort({ views: -1 });
                    const tv = await tv_1.default.find({
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    })
                        .skip(page * 10)
                        .limit(10)
                        .sort({ views: -1 });
                    const result = movie.concat(tv);
                    res.json({
                        page: page + 1,
                        results: result,
                        movie: movie,
                        tv: tv,
                        total: result.length,
                        total_movie: movie.length,
                        total_tv: tv.length,
                        page_size: 20,
                    });
                    break;
                case 'movie':
                    const movies = await movie_1.default.find({
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    })
                        .skip(page * 20)
                        .limit(20)
                        .sort({ views: -1 });
                    res.json({
                        page: page + 1,
                        results: movies,
                        total: movies.length,
                        page_size: 20,
                    });
                    break;
                case 'tv':
                    const tvs = await tv_1.default.find({
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { original_name: { $regex: query, $options: 'i' } },
                        ],
                    })
                        .skip(page * 20)
                        .limit(20)
                        .sort({ views: -1 });
                    res.json({
                        page: page + 1,
                        results: tvs,
                        total: tvs.length,
                        page_size: 20,
                    });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Search with type: ${req.params.type} is not found!`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SearchController();
//# sourceMappingURL=searchController.js.map