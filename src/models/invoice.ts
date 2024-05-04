import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Invoice = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4() },
    account_id: { type: String },
    session_id: { type: String },
    customer_id: { type: String },
    subscription_id: { type: String },
    plan_id: { type: String },
    invoice_id: { type: String },
    description: { type: String },
    session: { type: Object },
    subscription: { type: Object },
    invoice: { type: Object },
    customer_details: { type: Object },
    unit_amount: { type: Number },
    quantity: { type: Number, default: 1 },
    amount_total: { type: Number },
    amount_due: { type: Number },
    amount_paid: { type: Number },
    amount_remaining: { type: Number },
    amount_discount: { type: Number, default: 0 },
    amount_tax: { type: Number, default: 0 },
    currency: {
      type: String,
      enum: ['vnd', 'usd'],
      default: 'vnd'
    },
    items: { type: Array },
    status: {
      type: String,
      enum: ['complete', 'pending', 'incomplete', 'canceled', 'expired'],
      default: 'pending'
    },
    payment_status: {
      type: String,
      enum: ['paid', 'unpaid', 'error'],
      default: 'unpaid'
    },
    payment_method: {
      type: String,
      enum: ['momo', 'zalopay', 'vnpay', 'stripe']
    },
    period_start: { type: Date, default: Date.now },
    period_end: { type: Date },
    url: { type: String },
    success_url: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('invoices', Invoice);
