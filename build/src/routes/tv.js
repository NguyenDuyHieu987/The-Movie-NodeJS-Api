"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tvController_1 = __importDefault(require("@/controllers/tvController"));
const tvSlugController_1 = __importDefault(require("@/controllers/tvSlugController"));
const router = express_1.default.Router();
router.get('/detail/:id', tvController_1.default.get);
router.get('/:slug', tvSlugController_1.default.get);
exports.default = router;
//# sourceMappingURL=tv.js.map