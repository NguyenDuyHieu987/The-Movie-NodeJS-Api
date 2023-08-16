import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Genre = new Schema({
  id: { type: Number },
  name: { type: String },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Genre', Genre);
