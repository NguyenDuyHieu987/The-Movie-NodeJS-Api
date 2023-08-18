import mongoose from 'mongoose';

const Video = new mongoose.Schema({
  id: { type: String },
  items: { type: Array },
});

export default mongoose.model('videos', Video);
