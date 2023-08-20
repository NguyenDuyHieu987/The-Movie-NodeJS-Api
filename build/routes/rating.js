"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratingController_1 = __importDefault(require("@/controllers/ratingController"));
const router = express_1.default.Router();
router.get('/get/:type/:movieId', ratingController_1.default.get);
router.post('/:type/:movieId', ratingController_1.default.rate);
exports.default = router;
//# sourceMappingURL=rating.js.map