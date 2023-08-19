"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Account = new mongoose_1.default.Schema({
    id: { type: String },
    username: { type: String },
    password: { type: String },
    email: { type: String },
    full_name: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['normal', 'admin'], default: 'normal' },
    auth_type: { type: String, enum: ['email', 'google', 'facebook'] },
    created_at: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('accounts', Account);
//# sourceMappingURL=account.js.map