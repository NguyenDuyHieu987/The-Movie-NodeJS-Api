"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const Account = new Schema({
    id: { type: String },
    user_name: { type: String },
    password: { type: String },
    created_by: { type: String },
    name: { type: String },
    avatar: { type: String },
    email: { type: String },
    user_token: { type: String },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Account', Account);
//# sourceMappingURL=Account.js.map