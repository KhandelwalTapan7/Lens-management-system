import { runBreachScan } from '../services/breachAlert.service.js';

/**
 * Manually trigger a breach scan (in addition to the scheduled cron job).
 * Useful for demo purposes / testing.
 */
export const triggerBreachScan = async (req, res) => {
  try {
    const result = await runBreachScan();
    res.json({ message: 'Breach scan completed', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
