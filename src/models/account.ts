import mongoose from 'mongoose';

const Account = new mongoose.Schema(
  {
    id: { type: String },
    username: { type: String },
    password: { type: String },
    email: { type: String, default: null },
    full_name: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['normal', 'admin'], default: 'normal' },
    auth_type: { type: String, enum: ['email', 'google', 'facebook'] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('accounts', Account);
