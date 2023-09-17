"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const countryController_1 = __importDefault(require("@/controllers/countryController"));
const router = express_1.default.Router();
router.get('/:slug', countryController_1.default.get);
exports.default = router;
//# sourceMappingURL=country.js.map