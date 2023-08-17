"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const movie_1 = __importDefault(require("@/models/movie"));
class MovieController {
    async get(req, res, next) {
        try {
            const data = await movie_1.default.findOne({
                id: req.params.id,
            });
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new MovieController();
//# sourceMappingURL=movieController.js.map