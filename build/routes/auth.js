"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("@/controllers/authController"));
const router = express_1.default.Router();
router.post('/login', authController_1.default.logIn);
router.post('/loginfacebook', authController_1.default.logInFacebook);
router.post('/logingoogle', authController_1.default.logInGoogle);
router.get('/getusertoken', authController_1.default.getUserByToken);
router.post('/verify-signup/:type', authController_1.default.signUpVerify);
router.post('/signup', authController_1.default.signUp);
router.post('/forgot-password/:type', authController_1.default.forgotPassword);
router.post('/logout', authController_1.default.logOut);
exports.default = router;
//# sourceMappingURL=auth.js.map