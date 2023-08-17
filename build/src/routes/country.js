"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CountryController_1 = __importDefault(require("../controllers/CountryController"));
const router = express_1.default.Router();
// router.get('/:slug', tvController.detail);
router.get('/:slug', CountryController_1.default.index);
exports.default = router;
//# sourceMappingURL=country.js.map