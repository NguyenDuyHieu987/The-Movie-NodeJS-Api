"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Genre = new mongoose_1.default.Schema({
    id: { type: Number },
    name: { type: String },
    name_vietsub: { type: String },
    short_name: { type: String },
});
exports.default = mongoose_1.default.model('genres', Genre);
//# sourceMappingURL=genre.js.map