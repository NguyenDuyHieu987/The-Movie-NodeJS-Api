import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const LiveComment = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    user_id: { type: String },
    broadcast_id: { type: String },
    movie_id: { type: String },
    content: { type: String },
    timestamp: { type: Date },
    parent_id: { type: String },
    type: { type: String, enum: ['children', 'parent'], default: 'parent' },
    reply_to: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('livecomments', LiveComment);
