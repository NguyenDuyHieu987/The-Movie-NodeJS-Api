import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CommentLike = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    user_id: { type: String },
    comment_id: { type: String },
    type: { type: String, enum: ['like', 'dislike'] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('commentlikes', CommentLike);
