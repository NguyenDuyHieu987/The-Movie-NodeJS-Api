import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Image = new mongoose.Schema({
  id: { type: String, default: uuidv4() },
  items: { type: Object },
});

export default mongoose.model('images', Image);
