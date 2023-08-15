const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataMovies = new Schema({
  dates: { type: Object },
  page: { type: Number },
  results: { type: Array },
  total_pages: { type: Number },
  total_results: { type: Number },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

module.exports = {
  Trending: mongoose.model('Trending', DataMovies),
  Nowplaying: mongoose.model('Nowplaying', DataMovies),
  Upcoming: mongoose.model('Upcoming', DataMovies),
  Popular: mongoose.model('Popular', DataMovies),
  Toprated: mongoose.model('Toprated', DataMovies),
  TVAiringToday: mongoose.model('TVAiringToday', DataMovies),
  TVOnTheAir: mongoose.model('TVOnTheAir', DataMovies),
  TVPopular: mongoose.model('TVPopular', DataMovies),
  TVTopRated: mongoose.model('TVTopRated', DataMovies),
  PhimBo: mongoose.model('PhimBo', DataMovies),
  PhimLe: mongoose.model('PhimLe', DataMovies),
};
