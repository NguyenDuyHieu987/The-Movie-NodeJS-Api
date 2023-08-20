import mongoose from 'mongoose';

const Season = new mongoose.Schema(
  {
    air_date: { type: String },
    episodes: { type: Array },
    name: { type: String },
    overview: { type: String },
    id: { type: String },
    poster_path: { type: String },
    season_number: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('seasons', Season);
