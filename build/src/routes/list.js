"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const listController_1 = __importDefault(require("../controllers/listController"));
const router = express_1.default.Router();
// router.get('/:slug', tvController.detail);
router.get('/:slug', listController_1.default.get);
router.post('/:slug/add_item', listController_1.default.addItem);
router.post('/:slug/remove_item', listController_1.default.removeItem);
exports.default = router;
//# sourceMappingURL=list.js.map