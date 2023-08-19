"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const trending_1 = __importDefault(require("@/models/trending"));
const http_errors_1 = __importDefault(require("http-errors"));
class TrendingController {
    async get(req, res, next) {
        try {
            const page = +req.query?.page - 1 || 0;
            const limit = +req.query?.limit || 20;
            switch (req.params.slug) {
                case 'all':
                    const trending = await trending_1.default.find()
                        .skip(page * limit)
                        .limit(limit);
                    const total = await trending_1.default.countDocuments({});
                    return res.json({
                        page: page + 1,
                        results: trending,
                        total: total,
                        page_size: limit,
                    });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Not found with slug: ${req.params.slug} !`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TrendingController();
//# sourceMappingURL=trendingController.js.map