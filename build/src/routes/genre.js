"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GenreController_1 = __importDefault(require("../controllers/GenreController"));
const router = express_1.default.Router();
// router.get('/:slug', tvController.detail);
router.get('/:slug', GenreController_1.default.index);
exports.default = router;
//# sourceMappingURL=genre.js.map