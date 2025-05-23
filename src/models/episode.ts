import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Episode = new mongoose.Schema(
  {
    air_date: { type: String },
    name: { type: String },
    episode_type: { type: String },
    overview: { type: String },
    id: { type: String, default: uuidv4() },
    id_number: { type: Number },
    movie_id: { type: String },
    still_path: { type: String },
    video_path: { type: String },
    season_number: { type: Number },
    episode_number: { type: Number },
    duration: { type: Number, default: 0 },
    runtime: { type: Number, default: 0 },
    show_id: { type: Number },
    vote_average: { type: Number },
    vote_count: { type: Number },
    crew: { type: Array },
    guest_stars: { type: Array },
    vip: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    dominant_still_color: { type: Array },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export const EpisodeTest = mongoose.model('episodetests', Episode);

export default mongoose.model('episodes', Episode);
