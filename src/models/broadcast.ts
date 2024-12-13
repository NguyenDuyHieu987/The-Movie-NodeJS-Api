import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Broadcast = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    movie_id: { type: String },
    type: { type: String, enum: ['play', 'search', 'rate'] },
    number_of_interactions: { type: Number },
    rate_value: { type: Number },
    backdrop_path: { type: String },
    poster_path: { type: String },
    release_date: { type: String },
    name: { type: String },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('broadcasts', Broadcast);
