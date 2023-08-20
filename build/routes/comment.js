"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = __importDefault(require("@/controllers/commentController"));
const router = express_1.default.Router();
router.get('/get-all/:movieType/:movieId', commentController_1.default.getParent);
router.get('/get/:movieType/:movieId/:parentId', commentController_1.default.getChild);
router.post('/post/:movieType/:movieId', commentController_1.default.post);
router.put('/edit/:movieType/:movieId', commentController_1.default.edit);
router.delete('/delete/:movieType/:movieId', commentController_1.default.delete);
exports.default = router;
//# sourceMappingURL=comment.js.map