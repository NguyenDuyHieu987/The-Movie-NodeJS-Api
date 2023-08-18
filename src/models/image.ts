import mongoose from 'mongoose';

const Image = new mongoose.Schema({
  id: { type: String },
  items: { type: Object },
});

export default mongoose.model('images', Image);
