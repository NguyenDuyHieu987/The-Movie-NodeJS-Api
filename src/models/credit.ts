import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Credit = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    movie_id: { type: String },
    items: { type: Object }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('credits', Credit);
