"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MovieSlug = new mongoose_1.default.Schema({
    backdrop_path: { type: String },
    first_air_date: { type: String },
    last_air_date: { type: String },
    id: { type: String },
    name: { type: String },
    original_name: { type: String },
    origin_country: { type: Array },
    original_language: { type: String },
    overview: { type: String },
    poster_path: { type: String },
    media_type: { type: String },
    genres: { type: Array },
    episode_run_time: { type: Array },
}, { timestamps: true });
exports.default = {
    AiringToday: mongoose_1.default.model('tvairingtodays', MovieSlug),
    OnTheAir: mongoose_1.default.model('tvontheairs', MovieSlug),
    Popular: mongoose_1.default.model('tvpopulars', MovieSlug),
    TopRated: mongoose_1.default.model('tvtoprateds', MovieSlug),
};
//# sourceMappingURL=tvSlug.js.map