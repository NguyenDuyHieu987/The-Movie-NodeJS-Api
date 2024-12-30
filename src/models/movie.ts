import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// const Movie = new mongoose.Schema(
//   {
//     adult: { type: Boolean },
//     backdrop_path: { type: String },
//     belongs_to_collection: { type: Object },
//     budget: { type: Number },
//     genres: {
//       type: [
//         {
//           id: Number,
//           name: String
//         }
//       ]
//     },
//     homepage: { type: String },
//     id: { type: String, default: uuidv4() },
//     season_id: { type: String },
//     series_id: { type: String },
//     imdb_id: { type: String },
//     name: { type: String },
//     original_language: { type: String },
//     original_name: { type: String },
//     overview: { type: String },
//     popularity: { type: Number },
//     poster_path: { type: String },
//     production_companies: { type: Array },
//     production_countries: { type: Array },
//     release_date: { type: String },
//     revenue: { type: Number },
//     runtime: { type: Number },
//     spoken_languages: { type: Array },
//     status: { type: String },
//     tagline: { type: String },
//     media_type: { type: String },
//     video: { type: Boolean },
//     vote_average: { type: Number },
//     vote_count: { type: Number },
//     dominant_backdrop_color: { type: Array },
//     dominant_poster_color: { type: Array },
//     views: { type: Number },
//     vip: { type: Number },
//     created_at: { type: Date, default: Date.now },
//     updated_at: { type: Date, default: Date.now }
//   },
//   { timestamps: true, versionKey: false }
// );

const Movie = new mongoose.Schema(
  {
    adult: { type: Boolean },
    backdrop_path: { type: String },
    belongs_to_collection: { type: Object },
    budget: { type: Number },
    genres: {
      type: [
        {
          id: Number,
          name: String,
          name_vietsub: String,
          short_name: String
        }
      ]
    },
    homepage: { type: String },
    id: { type: String, default: uuidv4() },
    imdb_id: { type: String },
    name: { type: String },
    original_language: { type: mongoose.Schema.Types.Mixed },
    original_name: { type: String },
    overview: { type: String },
    popularity: { type: Number },
    poster_path: { type: String },
    production_companies: { type: Array },
    production_countries: { type: Array },
    release_date: { type: String },
    revenue: { type: Number },
    runtime: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    spoken_languages: { type: Array },
    status: { type: String },
    tagline: { type: String },
    media_type: { type: String },
    video: { type: Boolean },
    video_path: { type: String },
    vote_average: { type: Number },
    vote_count: { type: Number },
    dominant_backdrop_color: { type: Array },
    dominant_poster_color: { type: Array },
    views: { type: Number, default: 0 },
    vip: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    // TV Fields
    series_id: { type: String, default: uuidv4() },
    season_id: { type: String, default: uuidv4() },
    created_by: { type: Array, default: undefined },
    episode_run_time: { type: Number },
    first_air_date: { type: String },
    last_air_date: { type: String },
    last_episode_to_air: { type: Object },
    next_episode_to_air: { type: Object },
    networks: { type: Array, default: undefined },
    number_of_episodes: { type: Number },
    number_of_seasons: { type: Number }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const MovieTest = mongoose.model('movietests', Movie);

export default mongoose.model('movies', Movie);
