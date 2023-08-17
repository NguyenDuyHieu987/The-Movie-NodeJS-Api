"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movieController_1 = __importDefault(require("@/controllers/movieController"));
const movieSlugController_1 = __importDefault(require("@/controllers/movieSlugController"));
const router = express_1.default.Router();
router.get('/detail/:id', movieController_1.default.get);
router.get('/:slug', movieSlugController_1.default.get);
exports.default = router;
//# sourceMappingURL=movie.js.map