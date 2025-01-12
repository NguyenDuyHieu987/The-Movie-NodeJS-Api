import mongoose from 'mongoose';

const Genre = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String },
    english_name: { type: String },
    short_name: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('genres', Genre);
