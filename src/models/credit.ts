import mongoose from 'mongoose';

const Credit = new mongoose.Schema({
  id: { type: String },
  items: { type: Object },
});

export default mongoose.model('credits', Credit);
