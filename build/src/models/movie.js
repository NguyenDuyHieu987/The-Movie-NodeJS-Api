"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Movie = new mongoose_1.default.Schema({
    adult: { type: Boolean },
    backdrop_path: { type: String },
    belongs_to_collection: { type: Object },
    budget: { type: Number },
    genres: { type: Array },
    homepage: { type: String },
    id: { type: String },
    imdb_id: { type: String },
    name: { type: String },
    original_language: { type: String },
    original_name: { type: String },
    overview: { type: String },
    popularity: { type: Number },
    poster_path: { type: String },
    production_companies: { type: Array },
    production_countries: { type: Array },
    release_date: { type: String },
    revenue: { type: Number },
    runtime: { type: Number },
    spoken_languages: { type: Array },
    status: { type: String },
    tagline: { type: String },
    media_type: { type: String },
    video: { type: Boolean },
    vote_average: { type: Number },
    vote_count: { type: Number },
    dominant_backdrop_color: { type: Array },
    dominant_poster_color: { type: Array },
    views: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('movies', Movie);
//# sourceMappingURL=movie.js.map