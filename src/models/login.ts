import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Login = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    user_id: { type: String },
    username: { type: String },
    user_ip: { type: String },
    refresh_token: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('logins', Login);
