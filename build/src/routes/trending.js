"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trendingController_1 = __importDefault(require("@/controllers/trendingController"));
const router = express_1.default.Router();
router.get('/:slug', trendingController_1.default.get);
exports.default = router;
//# sourceMappingURL=trending.js.map