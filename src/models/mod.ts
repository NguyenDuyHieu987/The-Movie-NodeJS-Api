import mongoose from 'mongoose';

const Mod = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String },
    media_type: { type: String },
    order: { type: Number }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('mods', Mod);
