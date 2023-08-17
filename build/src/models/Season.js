"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const Season = new Schema({
    air_date: { type: String },
    episodes: { type: Array },
    name: { type: String },
    overview: { type: String },
    id: { type: Number },
    poster_path: { type: String },
    season_number: { type: Number },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Season', Season);
//# sourceMappingURL=Season.js.map