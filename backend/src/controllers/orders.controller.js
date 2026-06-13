import { Order } from '../models/Order.js';
import { StatusLog } from '../models/StatusLog.js';
import { checkLensAvailability } from '../services/inventoryCheck.service.js';
import { resolveSLAHours, computeSLADeadline } from '../services/slaCalculator.service.js';
import { ORDER_STATUSES, ACTIVE_STATUSES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new order:
 * 1. Resolve SLA hours for lens type + store
 * 2. Check lens inventory (in-house vs external)
 * 3. Save order with computed SLA deadline
 */
export const createOrder = async (req, res) => {
  try {
    const body = req.body;

    const slaHours = await resolveSLAHours(body.lensType, body.storeLocation);
    const orderPlacedAt = new Date();
    const slaDeadline = computeSLADeadline(orderPlacedAt, slaHours);

    const availability = await checkLensAvailability({
      lensType: body.lensType,
      lensIndex: body.lensIndex,
      coatings: body.coatings,
      prescription: body.prescription,
    });

    const order = new Order({
      ...body,
      slaHours,
      orderPlacedAt,
      slaDeadline,
      lensAvailability: availability.availability,
      currentStatus: 'ORDER_PLACED',
      statusHistory: [{ status: 'ORDER_PLACED', changedAt: orderPlacedAt, changedBy: 'system' }],
    });

    await order.save();

    await StatusLog.create({
      order: order._id,
      orderNumber: order.orderNumber,
      fromStatus: null,
      toStatus: 'ORDER_PLACED',
      changedBy: 'system',
    });

    res.status(201).json({
      order,
      lensAvailability: availability,
    });
  } catch (err) {
    logger.error('createOrder error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get all orders with optional filters: status, lensType, storeLocation.
 */
export const getOrders = async (req, res) => {
  try {
    const { status, lensType, storeLocation, activeOnly } = req.query;
    const filter = {};

    if (status) filter.currentStatus = status;
    if (lensType) filter.lensType = lensType;
    if (storeLocation) filter.storeLocation = storeLocation;
    if (activeOnly === 'true') filter.currentStatus = { $in: ACTIVE_STATUSES };

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    logger.error('getOrders error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single order by ID with full status history.
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const logs = await StatusLog.find({ order: order._id }).sort({ createdAt: 1 });
    res.json({ order, statusLogs: logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update order status. If status is QUALITY_CHECK -> QC_FAILED_REORDER,
 * increment reorderCount and loop back to LENS_SOURCING.
 * Requires a reason if there's a delay (manually flagged by team).
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { newStatus, changedBy, reasonForDelay, note } = req.body;

    if (!ORDER_STATUSES.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const previousStatus = order.currentStatus;
    const previousChangeTime =
      order.statusHistory[order.statusHistory.length - 1]?.changedAt || order.orderPlacedAt;

    const timeInPreviousStatusMinutes = Math.round(
      (new Date() - new Date(previousChangeTime)) / (1000 * 60)
    );

    // QC failure loop-back: increment reorder count and route back to LENS_SOURCING
    let effectiveNewStatus = newStatus;
    if (newStatus === 'QC_FAILED_REORDER') {
      order.reorderCount += 1;
    }

    order.currentStatus = effectiveNewStatus;
    order.statusHistory.push({
      status: effectiveNewStatus,
      changedAt: new Date(),
      changedBy: changedBy || 'system',
      reasonForDelay: reasonForDelay || null,
      note: note || null,
    });

    // Reset breach alert flag on status progress so future risk is re-evaluated
    order.breachAlertSent = false;

    await order.save();

    await StatusLog.create({
      order: order._id,
      orderNumber: order.orderNumber,
      fromStatus: previousStatus,
      toStatus: effectiveNewStatus,
      changedBy: changedBy || 'system',
      reasonForDelay: reasonForDelay || null,
      timeInPreviousStatusMinutes,
    });

    res.json(order);
  } catch (err) {
    logger.error('updateOrderStatus error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete/cancel an order.
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.currentStatus = 'CANCELLED';
    order.statusHistory.push({ status: 'CANCELLED', changedAt: new Date(), changedBy: req.body.changedBy || 'system' });
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
