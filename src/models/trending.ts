import mongoose from 'mongoose';

const Trending = new mongoose.Schema(
  {
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
    media_type: { type: String, enum: ['movie', 'tv'] },
    genres: { type: Array },
    runtime: { type: Number },
    episode_run_time: { type: Array },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('trendings', Trending);
