"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const Country = new Schema({
    iso_639_1: { type: String },
    english_name: { type: String },
    name: { type: String },
    name2: { type: String },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Country', Country);
//# sourceMappingURL=Country.js.map