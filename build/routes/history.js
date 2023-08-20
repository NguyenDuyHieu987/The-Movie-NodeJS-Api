"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const historyController_1 = __importDefault(require("@/controllers/historyController"));
const router = express_1.default.Router();
router.get('/get/:slug', historyController_1.default.get);
router.get('/search/:slug', historyController_1.default.search);
router.get('/getitem/:type/:movieId', historyController_1.default.getItem);
router.post('/additem', historyController_1.default.addItem);
router.delete('/removeitem', historyController_1.default.removeItem);
router.delete('/removeallitem', historyController_1.default.removeAllItem);
exports.default = router;
//# sourceMappingURL=history.js.map