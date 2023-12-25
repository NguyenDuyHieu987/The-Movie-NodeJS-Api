import mongoose from 'mongoose';

const MovieSlug = new mongoose.Schema(
  {
    backdrop_path: { type: String },
    first_air_date: { type: String },
    last_air_date: { type: String },
    id: { type: String },
    name: { type: String },
    original_name: { type: String },
    origin_country: { type: Array },
    original_language: { type: String },
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
    episode_run_time: { type: Array },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default {
  AiringToday: mongoose.model('tvairingtodays', MovieSlug),
  OnTheAir: mongoose.model('tvontheairs', MovieSlug),
  Popular: mongoose.model('tvpopulars', MovieSlug),
  TopRated: mongoose.model('tvtoprateds', MovieSlug)
};
