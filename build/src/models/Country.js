"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Country = new mongoose_1.default.Schema({
    iso_639_1: { type: String },
    english_name: { type: String },
    name: { type: String },
    short_name: { type: String },
});
exports.default = mongoose_1.default.model('countries', Country);
//# sourceMappingURL=country.js.map