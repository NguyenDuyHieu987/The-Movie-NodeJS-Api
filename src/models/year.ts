import mongoose from 'mongoose';

const Year = new mongoose.Schema(
  {
    name: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('years', Year);
