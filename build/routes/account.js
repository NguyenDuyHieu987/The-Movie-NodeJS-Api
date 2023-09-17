"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accountController_1 = __importDefault(require("@/controllers/accountController"));
const router = express_1.default.Router();
router.post('/change-password', accountController_1.default.changePassword);
router.post('/change-email', accountController_1.default.changeEmail);
router.post('/verify/:type', accountController_1.default.verify);
exports.default = router;
//# sourceMappingURL=account.js.map