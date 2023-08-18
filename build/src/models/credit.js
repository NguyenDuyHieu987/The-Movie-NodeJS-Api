"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Credit = new mongoose_1.default.Schema({
    id: { type: String },
    items: { type: Object },
});
exports.default = mongoose_1.default.model('credits', Credit);
//# sourceMappingURL=credit.js.map