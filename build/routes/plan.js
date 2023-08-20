"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const planController_1 = __importDefault(require("@/controllers/planController"));
const router = express_1.default.Router();
router.get('/get', planController_1.default.get);
exports.default = router;
//# sourceMappingURL=plan.js.map