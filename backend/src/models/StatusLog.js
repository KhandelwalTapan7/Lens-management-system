import mongoose from 'mongoose';
import { ORDER_STATUSES } from '../utils/constants.js';

// Separate audit-log collection (in addition to embedded statusHistory on Order)
// useful for analytics/training data for the TAT prediction model
const statusLogSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    fromStatus: { type: String, enum: [...ORDER_STATUSES, null], default: null },
    toStatus: { type: String, enum: ORDER_STATUSES, required: true },
    changedBy: { type: String, default: 'system' },
    reasonForDelay: { type: String, default: null },
    timeInPreviousStatusMinutes: { type: Number, default: null },
  },
  { timestamps: true }
);

export const StatusLog = mongoose.model('StatusLog', statusLogSchema);
