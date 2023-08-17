"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Trending = new mongoose_1.default.Schema({
    adult: { type: Boolean },
    backdrop_path: { type: String },
    first_air_date: { type: String },
    last_air_date: { type: String },
    release_date: { type: String },
    id: { type: String },
    name: { type: String },
    original_name: { type: String },
    overview: { type: String },
    poster_path: { type: String },
    media_type: { type: String },
    genres: { type: Array },
    runtime: { type: Number },
});
exports.default = mongoose_1.default.model('trendings', Trending);
//# sourceMappingURL=trending.js.map