import { LENS_SLA_HOURS, BREACH_RISK_THRESHOLD } from '../utils/constants.js';
import { SLAConfig } from '../models/SLA.js';

/**
 * Resolve SLA hours for a given lens type & store location.
 * Falls back to default LENS_SLA_HOURS if no override exists.
 */
export const resolveSLAHours = async (lensType, storeLocation) => {
  const override = await SLAConfig.findOne({
    lensType,
    storeLocation: { $in: [storeLocation, 'ALL'] },
  }).sort({ storeLocation: -1 }); // prefer store-specific over 'ALL'

  if (override) return override.slaHours;
  return LENS_SLA_HOURS[lensType] || 48;
};

/**
 * Compute SLA deadline from order placement time + SLA hours.
 */
export const computeSLADeadline = (orderPlacedAt, slaHours) => {
  const deadline = new Date(orderPlacedAt);
  deadline.setHours(deadline.getHours() + slaHours);
  return deadline;
};

/**
 * Compute time remaining (ms) and breach status for an order.
 */
export const getTimeRemaining = (order) => {
  const now = new Date();
  const deadline = new Date(order.slaDeadline);
  const remainingMs = deadline.getTime() - now.getTime();
  const isBreached = remainingMs < 0 && !['DELIVERED', 'CANCELLED'].includes(order.currentStatus);

  return {
    remainingMs,
    remainingHours: Math.round((remainingMs / (1000 * 60 * 60)) * 10) / 10,
    isBreached,
  };
};

/**
 * Heuristic at-risk check: % of SLA time elapsed exceeds threshold and order not yet delivered.
 */
export const isAtRisk = (order) => {
  const now = new Date();
  const placed = new Date(order.orderPlacedAt);
  const deadline = new Date(order.slaDeadline);

  const totalDuration = deadline.getTime() - placed.getTime();
  const elapsed = now.getTime() - placed.getTime();
  const fractionElapsed = elapsed / totalDuration;

  return (
    !['DELIVERED', 'CANCELLED'].includes(order.currentStatus) &&
    fractionElapsed >= BREACH_RISK_THRESHOLD
  );
};
