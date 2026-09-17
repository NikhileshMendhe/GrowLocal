import cron from 'node-cron';

import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { expireStaleEnquiries } from './expireStaleEnquiries.js';
import { expireDemandRequests } from './expireDemandRequests.js';

/**
 * node-cron wiring (§4 jobs/scheduler.js). Runs inside the API process —
 * fine at this scale; split to a worker only if the API becomes I/O-bound.
 */
export function startJobs() {
  if (env.isTest) return;

  cron.schedule('*/10 * * * *', async () => {
    try {
      const result = await expireStaleEnquiries();
      if (result.enquiries || result.offers) {
        logger.info(result, 'job: expired stale enquiries/offers');
      }
    } catch (error) {
      logger.error({ err: error }, 'job: expireStaleEnquiries failed');
    }
  });

  cron.schedule('15 3 * * *', async () => {
    try {
      const count = await expireDemandRequests();
      if (count) logger.info({ count }, 'job: expired demand requests');
    } catch (error) {
      logger.error({ err: error }, 'job: expireDemandRequests failed');
    }
  });

  logger.info('Background jobs scheduled');
}
