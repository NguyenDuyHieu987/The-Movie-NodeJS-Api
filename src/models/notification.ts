import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Notification = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    user_id: { type: String },
    title: { type: String },
    message: { type: String },
    image_path: { type: String },
    type: { type: String },
    is_hidden: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('notifications', Notification);
