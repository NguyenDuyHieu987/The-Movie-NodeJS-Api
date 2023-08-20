"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const List = new mongoose_1.default.Schema({
    id: { type: String, default: (0, uuid_1.v4)() },
    user_id: { type: String },
    movie_id: { type: String },
    backdrop_path: { type: String },
    release_date: { type: String },
    first_air_date: { type: String },
    last_air_date: { type: String },
    name: { type: String },
    original_name: { type: String },
    original_language: { type: String },
    poster_path: { type: String },
    media_type: { type: String },
    genres: { type: Array },
    dominant_backdrop_color: { type: Array },
    dominant_poster_color: { type: Array },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });
exports.default = mongoose_1.default.model('lists', List);
//# sourceMappingURL=list.js.map