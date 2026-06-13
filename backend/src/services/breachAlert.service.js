import { Order } from '../models/Order.js';
import { ACTIVE_STATUSES } from '../utils/constants.js';
import { predictTAT } from './tatPrediction.service.js';
import { getTimeRemaining, isAtRisk } from './slaCalculator.service.js';
import { sendBreachAlert } from './notification.service.js';
import { logger } from '../utils/logger.js';

/**
 * Scans all active orders, runs TAT prediction on each, updates the order's
 * predicted breach risk, and sends alerts for newly at-risk / breached orders.
 * Called by the cron job and can also be triggered manually via API.
 */
export const runBreachScan = async () => {
  const activeOrders = await Order.find({ currentStatus: { $in: ACTIVE_STATUSES } });

  let alertsSent = 0;

  for (const order of activeOrders) {
    const prediction = await predictTAT(order);
    const { isBreached } = getTimeRemaining(order);
    const atRisk = isAtRisk(order) || prediction.breachProbability >= 0.6;

    order.predictedBreachRisk = prediction.breachProbability;
    order.isBreached = isBreached;

    // Send alert only once per breach-risk window (avoid spamming)
    if ((atRisk || isBreached) && !order.breachAlertSent) {
      await sendBreachAlert(order, prediction);
      order.breachAlertSent = true;
      alertsSent += 1;
      logger.info(`Breach alert sent for order ${order.orderNumber}`);
    }

    // Reset alert flag if order is no longer at risk (e.g. status updated, deadline extended)
    if (!atRisk && !isBreached && order.breachAlertSent) {
      order.breachAlertSent = false;
    }

    await order.save();
  }

  return { scanned: activeOrders.length, alertsSent };
};
