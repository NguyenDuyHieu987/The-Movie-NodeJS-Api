import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Image = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    movie_id: { type: String },
    items: { type: Object }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('images', Image);
