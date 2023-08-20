"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Season = new mongoose_1.default.Schema({
    air_date: { type: String },
    episodes: { type: Array },
    name: { type: String },
    overview: { type: String },
    id: { type: String },
    poster_path: { type: String },
    season_number: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });
exports.default = mongoose_1.default.model('seasons', Season);
//# sourceMappingURL=season.js.map