"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const genre_1 = __importDefault(require("@/models/genre"));
class GenreController {
    async get(req, res, next) {
        try {
            switch (req.params.slug) {
                case 'all':
                    const data = await genre_1.default.find();
                    res.json({ results: data });
                    break;
                default:
                    next(http_errors_1.default.NotFound(`Genres with slug: ${req.params.slug} is not found!`));
                    break;
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new GenreController();
//# sourceMappingURL=genreController.js.map