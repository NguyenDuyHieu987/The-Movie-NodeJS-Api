"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MovieSlug = new mongoose_1.default.Schema({
    adult: { type: Boolean },
    backdrop_path: { type: String },
    release_date: { type: String },
    id: { type: String },
    name: { type: String },
    original_name: { type: String },
    original_language: { type: String },
    overview: { type: String },
    poster_path: { type: String },
    media_type: { type: String },
    genres: { type: Array },
    runtime: { type: Number },
}, { timestamps: true, versionKey: false });
exports.default = {
    NowPlaying: mongoose_1.default.model('nowplayings', MovieSlug),
    UpComing: mongoose_1.default.model('upcomings', MovieSlug),
    Popular: mongoose_1.default.model('populars', MovieSlug),
    TopRated: mongoose_1.default.model('toprateds', MovieSlug),
};
//# sourceMappingURL=movieSlug.js.map