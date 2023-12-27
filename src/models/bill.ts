import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Bill = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    account_id: { type: String },
    subscription_id: { type: String },
    description: { type: String },
    session: { type: Object },
    subscription: { type: Object },
    customer_details: { type: Object },
    status: { type: String },
    payment_status: { type: String },
    payment_method: {
      type: String,
      enum: ['momo', 'zalopay', 'vnpay', 'stripe']
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('bills', Bill);
