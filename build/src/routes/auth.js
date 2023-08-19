"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("@/controllers/authController"));
const router = express_1.default.Router();
router.post('/login', authController_1.default.login);
router.post('/signup', authController_1.default.signup);
router.post('/getusertoken', authController_1.default.getUserByUserToken);
exports.default = router;
//# sourceMappingURL=auth.js.map