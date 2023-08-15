const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Movie = new Schema({
  adult: { type: Boolean },
  backdrop_path: { type: String },
  belongs_to_collection: { type: Object },
  budget: { type: Number },
  genres: { type: Array },
  homepage: { type: String },
  id: { type: Number },
  imdb_id: { type: String },
  original_language: { type: String },
  original_title: { type: String },
  original_name: { type: String },
  overview: { type: String },
  popularity: { type: Number },
  poster_path: { type: String },
  production_companies: { type: Array },
  production_countries: { type: Array },
  release_date: { type: String },
  revenue: { type: Number },
  runtime: { type: Number },
  spoken_languages: { type: Array },
  status: { type: String },
  tagline: { type: String },
  title: { type: String },
  name: { type: String },
  video: { type: Boolean },
  vote_average: { type: Number },
  vote_count: { type: Number },
  videos: { type: Object },
  credits: { type: Object },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('movie', Movie);
