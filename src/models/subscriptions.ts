import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Subscription = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    account_id: { type: String },
    subscription_id: { type: String },
    plan_id: { type: String },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date },
    trial_date: { type: Date, default: Date.now },
    trial_end: { type: Date },
    status: { type: String, enum: ['trialing', 'active', 'inactive', 'pause'] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('subscriptions', Subscription);
