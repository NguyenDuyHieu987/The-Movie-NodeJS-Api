import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Bill = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    account_id: { type: String },
    customer_details: { type: Object },
    bill_detail: { type: Object },
    payment_method: { type: String },
    plan_order: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('bills', Bill);
