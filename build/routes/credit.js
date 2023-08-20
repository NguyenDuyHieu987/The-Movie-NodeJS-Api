"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creditController_1 = __importDefault(require("@/controllers/creditController"));
const router = express_1.default.Router();
router.get('/:id', creditController_1.default.get);
exports.default = router;
//# sourceMappingURL=credit.js.map