import { Order } from '../models/Order.js';
import { ACTIVE_STATUSES, ORDER_STATUSES } from '../utils/constants.js';
import { getTimeRemaining } from '../services/slaCalculator.service.js';

/**
 * Dashboard summary: counts by status, breaches, at-risk orders,
 * and a list of all active orders enriched with time-remaining info.
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const { status, lensType, storeLocation } = req.query;

    const filter = { currentStatus: { $in: ACTIVE_STATUSES } };
    if (status) filter.currentStatus = status;
    if (lensType) filter.lensType = lensType;
    if (storeLocation) filter.storeLocation = storeLocation;

    const orders = await Order.find(filter).sort({ slaDeadline: 1 });

    const enriched = orders.map((order) => {
      const { remainingMs, remainingHours, isBreached } = getTimeRemaining(order);
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        lensType: order.lensType,
        storeLocation: order.storeLocation,
        currentStatus: order.currentStatus,
        lensAvailability: order.lensAvailability,
        slaDeadline: order.slaDeadline,
        remainingHours,
        isBreached,
        predictedBreachRisk: order.predictedBreachRisk,
        reorderCount: order.reorderCount,
      };
    });

    // Status-wise counts (across ALL orders, not just filtered)
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    ]);

    const statusCountMap = {};
    ORDER_STATUSES.forEach((s) => (statusCountMap[s] = 0));
    statusCounts.forEach((s) => (statusCountMap[s._id] = s.count));

    const breachedCount = enriched.filter((o) => o.isBreached).length;
    const atRiskCount = enriched.filter((o) => o.predictedBreachRisk >= 0.6 && !o.isBreached).length;

    res.json({
      totalActive: enriched.length,
      breachedCount,
      atRiskCount,
      statusCounts: statusCountMap,
      orders: enriched,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
