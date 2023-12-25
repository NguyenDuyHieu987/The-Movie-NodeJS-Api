import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Search = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    movie_id: { type: String },
    user_id: { type: String },
    type: { type: String, enum: ['search', 'history'] },
    query: { type: String },
    search_times: { type: Number, default: 0 },
    adult: { type: Boolean },
    backdrop_path: { type: String },
    first_air_date: { type: String },
    last_air_date: { type: String },
    release_date: { type: String },
    name: { type: String },
    original_name: { type: String },
    original_language: { type: String },
    overview: { type: String },
    poster_path: { type: String },
    media_type: { type: String, enum: ['movie', 'tv'] },
    genres: { type: Array },
    runtime: { type: Number },
    episode_run_time: { type: Array },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('searchs', Search);
