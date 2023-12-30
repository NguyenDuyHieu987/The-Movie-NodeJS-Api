import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Plan = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    name: { type: String },
    price: { type: Number },
    video_quality: { type: String },
    resolution: { type: String },
    support_devices: { type: Array },
    ads: { type: Boolean },
    order: { type: Number },
    vip: { type: Number }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('plans', Plan);
