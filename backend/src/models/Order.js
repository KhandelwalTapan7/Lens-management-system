import mongoose from 'mongoose';
import { ORDER_STATUSES, LENS_INDICES, COATINGS, ORDER_SOURCES, LENS_SLA_HOURS } from '../utils/constants.js';

const prescriptionSchema = new mongoose.Schema({
  rightEye: {
    sph: Number,
    cyl: Number,
    axis: Number,
    add: Number,
  },
  leftEye: {
    sph: Number,
    cyl: Number,
    axis: Number,
    add: Number,
  },
  pd: Number, // pupillary distance
}, { _id: false });

const statusLogEntrySchema = new mongoose.Schema({
  status: { type: String, enum: ORDER_STATUSES, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String, default: 'system' },
  reasonForDelay: { type: String, default: null },
  note: { type: String, default: null },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    source: { type: String, enum: ORDER_SOURCES, required: true },
    storeLocation: { type: String, required: true, index: true },

    // Eyewear specific fields
    prescription: prescriptionSchema,
    lensType: { type: String, enum: Object.keys(LENS_SLA_HOURS), required: true, index: true },
    lensIndex: { type: String, enum: LENS_INDICES, required: true },
    coatings: [{ type: String, enum: COATINGS }],
    frameModel: { type: String, required: true },
    frameColor: { type: String },

    // Inventory linkage
    lensAvailability: {
      type: String,
      enum: ['IN_HOUSE', 'EXTERNAL_PROCUREMENT', 'PENDING_CHECK'],
      default: 'PENDING_CHECK',
    },

    // Lifecycle
    currentStatus: { type: String, enum: ORDER_STATUSES, default: 'ORDER_PLACED', index: true },
    statusHistory: [statusLogEntrySchema],

    // SLA tracking
    slaHours: { type: Number, required: true },
    orderPlacedAt: { type: Date, default: Date.now },
    slaDeadline: { type: Date, required: true },
    isBreached: { type: Boolean, default: false },
    breachAlertSent: { type: Boolean, default: false },

    // QC / re-order loop
    reorderCount: { type: Number, default: 0 },

    // AI predictions
    predictedBreachRisk: { type: Number, default: 0 }, // 0-1 probability
    predictedDeliveryDate: { type: Date, default: null },

    price: { type: Number, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ currentStatus: 1, lensType: 1, storeLocation: 1 });

export const Order = mongoose.model('Order', orderSchema);
