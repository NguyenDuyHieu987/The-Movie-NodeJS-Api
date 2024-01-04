import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Subscription = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    account_id: { type: String },
    subscription_id: { type: String },
    customer_id: { type: String },
    subscription: { type: Object },
    description: { type: String },
    latest_invoice: { type: String },
    plan_id: { type: String },
    start_date: { type: Date, default: Date.now },
    ended_date: { type: Date },
    current_period_start: { type: Date, default: Date.now },
    current_period_end: { type: Date },
    trial_start: { type: Date, default: Date.now },
    trial_end: { type: Date },
    billing_cycle_anchor: { type: Date },
    interval: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      default: 'month'
    },
    interval_count: { type: Number, default: 1 },
    status: {
      type: String,
      enum: [
        'trialing',
        'active',
        'inactive',
        'paused',
        'past_due',
        'canceled',
        'unpaid'
      ],
      default: 'trialing'
    },
    canceled_at: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('subscriptions', Subscription);
