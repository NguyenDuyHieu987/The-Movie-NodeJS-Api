import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const WatchList = new Schema({
  created_by: { type: String },
  description: { type: String },
  favorite_count: { type: Number },
  id: { type: String },
  item_count: { type: Number },
  iso_639_1: { type: String },
  name: { type: String },
  poster_path: { type: String },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('WatchList', WatchList);
