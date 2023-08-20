"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const listController_1 = __importDefault(require("@/controllers/listController"));
const router = express_1.default.Router();
router.get('/get/:slug', listController_1.default.get);
router.get('/search/:slug', listController_1.default.search);
router.get('/getitem/:type/:movieId', listController_1.default.getItem);
router.post('/additem', listController_1.default.addItem);
router.delete('/removeitem', listController_1.default.removeItem);
router.delete('/removeallitem', listController_1.default.removeAllItem);
exports.default = router;
//# sourceMappingURL=list.js.map