"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ItemList = new Schema({
    adult: { type: Boolean },
    backdrop_path: { type: String },
    genre_ids: { type: Array },
    genres: { type: Array },
    id: { type: Number },
    media_type: { type: String },
    original_language: { type: String },
    original_title: { type: String },
    overview: { type: String },
    popularity: { type: Number },
    poster_path: { type: String },
    release_date: { type: String },
    first_air_date: { type: String },
    title: { type: String },
    name: { type: String },
    video: { type: Boolean },
    vote_average: { type: Number },
    vote_count: { type: Number },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
});
exports.default = {
    ItemList: mongoose_1.default.model('ItemList', ItemList),
    typeOfItem: ItemList,
};
//# sourceMappingURL=ItemList.js.map