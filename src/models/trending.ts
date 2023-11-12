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
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('trendings', Trending);
