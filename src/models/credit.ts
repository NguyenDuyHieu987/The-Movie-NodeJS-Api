import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Credit = new mongoose.Schema({
  id: { type: String, default: uuidv4() },
  items: { type: Object },
});

export default mongoose.model('credits', Credit);
