"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const TV = new mongoose_1.default.Schema({
    adult: { type: Boolean },
    backdrop_path: { type: String },
    created_by: { type: Array },
    episode_run_time: { type: Array },
    first_air_date: { type: String },
    genres: { type: Array },
    homepage: { type: String },
    id: { type: String, default: (0, uuid_1.v4)() },
    in_production: { type: Boolean },
    languages: { type: Array },
    last_air_date: { type: String },
    last_episode_to_air: { type: Object },
    name: { type: String },
    title: { type: String },
    next_episode_to_air: { type: Object },
    networks: { type: Array },
    number_of_episodes: { type: Number },
    number_of_seasons: { type: Number },
    origin_country: { type: Array },
    original_language: { type: String },
    original_title: { type: String },
    original_name: { type: String },
    overview: { type: String },
    popularity: { type: Number },
    poster_path: { type: String },
    production_companies: { type: Array },
    production_countries: { type: Array },
    seasons: { type: Array },
    spoken_languages: { type: Array },
    status: { type: String },
    tagline: { type: String },
    media_type: { type: String },
    type: { type: String },
    vote_average: { type: Number },
    vote_count: { type: Number },
    credits: { type: Object },
    dominant_backdrop_color: { type: Array },
    dominant_poster_color: { type: Array },
    views: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true });
exports.default = mongoose_1.default.model('tvs', TV);
//# sourceMappingURL=tv.js.map