"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tv_1 = __importDefault(require("@/models/tv"));
class TVController {
    async get(req, res, next) {
        try {
            const data = await tv_1.default.findOne({
                id: req.params.id,
            });
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TVController();
//# sourceMappingURL=TVController.js.map