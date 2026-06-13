import { Inventory } from '../models/Inventory.js';
import { checkLensAvailability } from '../services/inventoryCheck.service.js';
import { logger } from '../utils/logger.js';

/**
 * Get all inventory entries, optionally filtered by lensType.
 */
export const getInventory = async (req, res) => {
  try {
    const { lensType } = req.query;
    const filter = lensType ? { lensType } : {};
    const items = await Inventory.find(filter).sort({ lensType: 1, lensIndex: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create or update an inventory entry (upsert by lensType+lensIndex+coating).
 */
export const upsertInventory = async (req, res) => {
  try {
    const { lensType, lensIndex, coating, sphMin, sphMax, cylMin, cylMax, stockQuantity, avgProcurementDays } = req.body;

    const item = await Inventory.findOneAndUpdate(
      { lensType, lensIndex, coating },
      { sphMin, sphMax, cylMin, cylMax, stockQuantity, avgProcurementDays, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res.json(item);
  } catch (err) {
    logger.error('upsertInventory error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Check availability for a hypothetical order (used by frontend before order creation,
 * or for ad-hoc lookups).
 */
export const checkAvailability = async (req, res) => {
  try {
    const result = await checkLensAvailability(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete an inventory entry.
 */
export const deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
