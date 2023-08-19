import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const List = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
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
  },
  { timestamps: true }
);

export default mongoose.model('lists', List);
