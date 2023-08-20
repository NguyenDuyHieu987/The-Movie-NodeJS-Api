"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const searchController_1 = __importDefault(require("@/controllers/searchController"));
const router = express_1.default.Router();
router.get('/:type', searchController_1.default.search);
exports.default = router;
//# sourceMappingURL=search.js.map