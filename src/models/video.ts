import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Video = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    items: { type: Array },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('videos', Video);
