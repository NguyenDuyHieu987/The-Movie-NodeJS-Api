import mongoose from 'mongoose';

const Year = new mongoose.Schema({
  name: { type: String },
});

export default mongoose.model('years', Year);
