import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ModList = new mongoose.Schema(
  {
    adult: { type: Boolean },
    backdrop_path: { type: String },
    release_date: { type: String },
    first_air_date: { type: String },
    last_air_date: { type: String },
    id: { type: String, default: uuidv4() },
    modId: { type: String },
    id_number: { type: Number },
    name: { type: String },
    original_name: { type: String },
    original_language: { type: mongoose.Schema.Types.Mixed },
    origin_country: { type: mongoose.Schema.Types.Mixed },
    overview: { type: String },
    poster_path: { type: String },
    media_type: { type: String },
    genres: {
      type: [
        {
          id: Number,
          name: String
        }
      ]
    },
    runtime: { type: Number },
    episode_run_time: { type: mongoose.Schema.Types.Mixed },
    dominant_backdrop_color: { type: Array },
    dominant_poster_color: { type: Array },
    page_tmdb: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('modlists', ModList);
