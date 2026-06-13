import mongoose from 'mongoose';
import { LENS_INDICES, COATINGS } from '../utils/constants.js';

// Tracks in-house stock for lens power/index/coating combinations
const inventorySchema = new mongoose.Schema(
  {
    lensType: { type: String, required: true, index: true },
    lensIndex: { type: String, enum: LENS_INDICES, required: true },
    coating: { type: String, enum: COATINGS, required: true },

    // Power range available in-house (sph/cyl bounds), derived from past stocking data
    sphMin: { type: Number, required: true },
    sphMax: { type: Number, required: true },
    cylMin: { type: Number, required: true },
    cylMax: { type: Number, required: true },

    stockQuantity: { type: Number, default: 0 },
    avgProcurementDays: { type: Number, default: 3 }, // if not in-house, external lead time

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

inventorySchema.index({ lensType: 1, lensIndex: 1, coating: 1 }, { unique: true });

export const Inventory = mongoose.model('Inventory', inventorySchema);
