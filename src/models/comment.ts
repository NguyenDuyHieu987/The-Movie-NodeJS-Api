import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Comment = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    user_id: { type: String },
    movie_id: { type: String },
    content: { type: String },
    username: { type: String },
    user_avatar: { type: String },
    movie_type: { type: String, enum: ['movie', 'tv'] },
    parent_id: { type: String },
    type: { type: String, enum: ['children', 'parent'], default: 'parent' },
    reply_to: { type: String },
    childrens: { type: Number },
    updated: { type: Boolean },
    like: { type: Number },
    dislike: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('comments', Comment);
