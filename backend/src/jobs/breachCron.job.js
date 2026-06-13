import cron from 'node-cron';
import { runBreachScan } from '../services/breachAlert.service.js';
import { logger } from '../utils/logger.js';

/**
 * Runs the breach scan every 15 minutes.
 * Schedule format: minute hour day month weekday
 */
export const startBreachCron = () => {
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running scheduled breach scan...');
    try {
      const result = await runBreachScan();
      logger.info(`Breach scan complete: ${result.scanned} orders scanned, ${result.alertsSent} alerts sent`);
    } catch (err) {
      logger.error('Breach scan failed:', err.message);
    }
  });

  logger.info('Breach-check cron job scheduled (every 15 minutes).');
};
