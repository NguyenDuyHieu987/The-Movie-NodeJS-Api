import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Bill = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    account_id: { type: String },
    session_id: { type: String },
    subscription_id: { type: String },
    session: { type: Object },
    subscription: { type: Object },
    payment_method: {
      type: String,
      enum: ['momo', 'zalopay', 'vnpay', 'stripe']
    },
    plan_order: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('bills', Bill);
