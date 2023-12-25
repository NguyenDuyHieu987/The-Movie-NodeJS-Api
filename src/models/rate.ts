import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Rate = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    user_id: { type: String },
    movie_id: { type: String },
    movie_type: { type: String },
    rate_value: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('rates', Rate);
