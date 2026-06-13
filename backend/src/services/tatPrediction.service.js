import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ORDER_STATUSES } from '../utils/constants.js';

/**
 * Calls the Python (FastAPI) TAT prediction microservice (ml/model/predict.py),
 * which serves a trained model (e.g. Gradient Boosting / RandomForest regressor
 * trained on order_history.csv) that outputs:
 *   - breachProbability (0-1)
 *   - predictedRemainingHours
 *
 * Falls back to a rule-based heuristic if the ML service is unreachable,
 * so the system remains functional end-to-end.
 */
export const predictTAT = async (order) => {
  const payload = buildFeaturePayload(order);

  try {
    const { data } = await axios.post(env.ML_SERVICE_URL, payload, { timeout: 4000 });
    return {
      breachProbability: data.breach_probability,
      predictedRemainingHours: data.predicted_remaining_hours,
      source: 'ml_model',
    };
  } catch (err) {
    logger.warn('ML service unreachable, using heuristic fallback:', err.message);
    return heuristicFallback(order);
  }
};

const buildFeaturePayload = (order) => {
  const stageIndex = ORDER_STATUSES.indexOf(order.currentStatus);
  const now = new Date();
  const placed = new Date(order.orderPlacedAt);
  const deadline = new Date(order.slaDeadline);

  return {
    lens_type: order.lensType,
    lens_index: order.lensIndex,
    coatings_count: order.coatings?.length || 0,
    lens_availability: order.lensAvailability,
    store_location: order.storeLocation,
    current_stage_index: stageIndex,
    total_stages: ORDER_STATUSES.length,
    reorder_count: order.reorderCount,
    hours_elapsed: (now - placed) / (1000 * 60 * 60),
    hours_until_deadline: (deadline - now) / (1000 * 60 * 60),
    sla_hours: order.slaHours,
  };
};

/**
 * Simple rule-based heuristic used when the ML microservice is down:
 * - Estimates remaining hours based on stages left and avg time per stage.
 * - Flags high breach probability if remaining SLA time < estimated remaining work.
 */
const heuristicFallback = (order) => {
  const stageIndex = ORDER_STATUSES.indexOf(order.currentStatus);
  const stagesLeft = ORDER_STATUSES.indexOf('DELIVERED') - stageIndex;
  const avgHoursPerStage = order.slaHours / ORDER_STATUSES.indexOf('DELIVERED');

  let predictedRemainingHours = stagesLeft * avgHoursPerStage;
  if (order.lensAvailability === 'EXTERNAL_PROCUREMENT') predictedRemainingHours += 24;
  if (order.reorderCount > 0) predictedRemainingHours += order.reorderCount * avgHoursPerStage * 2;

  const now = new Date();
  const deadline = new Date(order.slaDeadline);
  const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

  const breachProbability = Math.min(
    1,
    Math.max(0, (predictedRemainingHours - hoursUntilDeadline) / order.slaHours + 0.3)
  );

  return {
    breachProbability: Math.round(breachProbability * 100) / 100,
    predictedRemainingHours: Math.round(predictedRemainingHours * 10) / 10,
    source: 'heuristic_fallback',
  };
};
