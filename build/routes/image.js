"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const imageController_1 = __importDefault(require("@/controllers/imageController"));
const router = express_1.default.Router();
router.get('/:id', imageController_1.default.get);
exports.default = router;
//# sourceMappingURL=image.js.map