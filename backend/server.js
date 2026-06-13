import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import { startBreachCron } from './src/jobs/breachCron.job.js';
import { logger } from './src/utils/logger.js';

const start = async () => {
  await connectDB();
  startBreachCron();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
};

start();
