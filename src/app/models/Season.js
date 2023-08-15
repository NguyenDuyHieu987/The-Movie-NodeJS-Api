const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Season = new Schema({
  air_date: { type: String },
  episodes: { type: Array },
  name: { type: String },
  overview: { type: String },
  id: { type: Number },
  poster_path: { type: String },
  season_number: { type: Number },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Season', Season);
