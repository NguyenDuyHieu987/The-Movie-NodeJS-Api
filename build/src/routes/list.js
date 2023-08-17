"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ListController_1 = __importDefault(require("../controllers/ListController"));
const router = express_1.default.Router();
// router.get('/:slug', tvController.detail);
router.get('/:slug', ListController_1.default.index);
router.post('/:slug/add_item', ListController_1.default.addItem);
router.post('/:slug/remove_item', ListController_1.default.removeItem);
exports.default = router;
//# sourceMappingURL=list.js.map