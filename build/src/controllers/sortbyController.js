"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const sortby_1 = __importDefault(require("@/models/sortby"));
class SortOptionController {
    async get(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'all':
                    const data = await sortby_1.default.find();
                    res.json({ results: data });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Sort options with slug: ${req.params.slug} is not found!`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SortOptionController();
//# sourceMappingURL=sortbyController.js.map