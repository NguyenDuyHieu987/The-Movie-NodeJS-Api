import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Year = new Schema({
  name: { type: String },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Year', Year);
