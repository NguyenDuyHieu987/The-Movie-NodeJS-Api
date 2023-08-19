import mongoose from 'mongoose';

const Country = new mongoose.Schema(
  {
    iso_639_1: { type: String },
    english_name: { type: String },
    name: { type: String },
    short_name: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('countries', Country);
