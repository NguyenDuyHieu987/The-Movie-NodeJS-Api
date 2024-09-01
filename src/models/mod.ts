import mongoose from 'mongoose';

const Mod = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String },
    type: { type: String },
    media_type: { type: String },
    order: { type: Number },
    path: { type: String }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('mods', Mod);
