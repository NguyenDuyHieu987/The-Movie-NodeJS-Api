"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rankingController_1 = __importDefault(require("@/controllers/rankingController"));
const router = express_1.default.Router();
router.get('/:slug', rankingController_1.default.get);
exports.default = router;
//# sourceMappingURL=ranking.js.map