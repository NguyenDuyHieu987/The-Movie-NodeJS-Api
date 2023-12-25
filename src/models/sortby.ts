import mongoose from 'mongoose';

const Year = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('sortbys', Year);
