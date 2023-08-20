"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Year = new mongoose_1.default.Schema({
    id: { type: String },
    name: { type: String },
}, { timestamps: true, versionKey: false });
exports.default = mongoose_1.default.model('sortbys', Year);
//# sourceMappingURL=sortby.js.map