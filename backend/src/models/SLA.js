import mongoose from 'mongoose';
import { LENS_SLA_HOURS } from '../utils/constants.js';

// Allows admins to override default SLA hours per lens type / store
const slaSchema = new mongoose.Schema(
  {
    lensType: { type: String, enum: Object.keys(LENS_SLA_HOURS), required: true },
    storeLocation: { type: String, default: 'ALL' },
    slaHours: { type: Number, required: true },
  },
  { timestamps: true }
);

slaSchema.index({ lensType: 1, storeLocation: 1 }, { unique: true });

export const SLAConfig = mongoose.model('SLAConfig', slaSchema);
