"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const updateViewContronllers_1 = __importDefault(require("@/controllers/updateViewContronllers"));
const router = express_1.default.Router();
router.post('/:movieType/:movieId', updateViewContronllers_1.default.update);
exports.default = router;
//# sourceMappingURL=updateView.js.map