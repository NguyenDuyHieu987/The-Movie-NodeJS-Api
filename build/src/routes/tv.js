"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TVController_1 = __importDefault(require("../controllers/TVController"));
const router = express_1.default.Router();
// router.get('/:slug', tvController.detail);
router.get('/:slug', TVController_1.default.index);
router.get('/:movieid/season/:seasonnumber', TVController_1.default.season);
router.post('/:movieid/:slug1', TVController_1.default.update);
exports.default = router;
//# sourceMappingURL=tv.js.map