const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Country = new Schema({
  iso_639_1: { type: String },
  english_name: { type: String },
  name: { type: String },
  name2: { type: String },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Country', Country);
