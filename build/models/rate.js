"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const Rate = new mongoose_1.default.Schema({
    id: { type: String, default: (0, uuid_1.v4)() },
    user_id: { type: String },
    movie_id: { type: String },
    movie_type: { type: String },
    rate_value: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });
exports.default = mongoose_1.default.model('rates', Rate);
//# sourceMappingURL=rate.js.map