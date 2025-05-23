import mongoose from 'mongoose';

const Country = new mongoose.Schema(
  {
    iso_3166_1: { type: String },
    english_name: { type: String },
    name: { type: String },
    short_name: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('countries', Country);
