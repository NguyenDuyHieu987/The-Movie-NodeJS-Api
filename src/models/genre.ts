import mongoose from 'mongoose';

const Genre = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String },
    name_vietsub: { type: String },
    short_name: { type: String }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('genres', Genre);
