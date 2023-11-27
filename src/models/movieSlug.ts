import mongoose from 'mongoose';

const MovieSlug = new mongoose.Schema(
  {
    adult: { type: Boolean },
    backdrop_path: { type: String },
    release_date: { type: String },
    id: { type: String },
    name: { type: String },
    original_name: { type: String },
    original_language: { type: String },
    overview: { type: String },
    poster_path: { type: String },
    media_type: { type: String },
    genres: {
      type: [
        {
          id: Number,
          name: String,
        },
      ],
    },
    runtime: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

export default {
  NowPlaying: mongoose.model('nowplayings', MovieSlug),
  UpComing: mongoose.model('upcomings', MovieSlug),
  Popular: mongoose.model('populars', MovieSlug),
  TopRated: mongoose.model('toprateds', MovieSlug),
};
