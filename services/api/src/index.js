import http from 'node:http';

import { env } from './config/env.js';
import { createApp } from './app.js';
import { initSocket } from './realtime/socket.js';
import { startJobs } from './jobs/scheduler.js';
import { pool } from './db/pool.js';
import { logger } from './utils/logger.js';

async function main() {
  await pool.query('SELECT 1');

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  startJobs();

  server.listen(env.port, () => {
    logger.info(`GrowLocal API listening on :${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down`);
    server.close();
    await pool.end().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error({ err: error }, 'Failed to start API');
  process.exit(1);
});
