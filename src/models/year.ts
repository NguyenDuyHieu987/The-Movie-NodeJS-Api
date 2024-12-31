import mongoose, { Types } from 'mongoose';

const Year = new mongoose.Schema(
  {
    name: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('years', Year);
