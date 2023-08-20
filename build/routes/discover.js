"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const discoverController_1 = __importDefault(require("@/controllers/discoverController"));
const router = express_1.default.Router();
router.get('/:slug', discoverController_1.default.get);
exports.default = router;
//# sourceMappingURL=discover.js.map