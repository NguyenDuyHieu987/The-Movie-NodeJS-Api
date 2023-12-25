import mongoose from 'mongoose';

const Season = new mongoose.Schema(
  {
    air_date: { type: String },
    name: { type: String },
    overview: { type: String },
    id: { type: String },
    movie_id: { type: String },
    season_id: { type: String },
    series_id: { type: String },
    still_path: { type: String },
    season_number: { type: Number },
    episode_number: { type: Number },
    runtime: { type: Number },
    show_id: { type: Number },
    vote_average: { type: Number },
    vote_count: { type: Number },
    crew: { type: Array },
    guest_stars: { type: Array },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('episodes', Season);
