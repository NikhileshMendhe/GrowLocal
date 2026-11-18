import http from 'node:http';

import { env } from './config/env.js';
import { createApp } from './app.js';
import { initSocket } from './realtime/socket.js';
import { startJobs } from './jobs/scheduler.js';
import { pool } from './db/pool.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    await pool.query('SELECT 1');
    logger.info('Connected to PostgreSQL database');
  } catch (error) {
    logger.warn({ err: error.message }, 'Database connection not ready (Supabase project may be paused or unreachable). API server starting in degraded mode.');
  }

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  startJobs();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${env.port} currently in use, retrying in 1s...`);
      setTimeout(() => {
        try { server.close(); } catch {}
        server.listen(env.port, () => {
          logger.info(`GrowLocal API listening on :${env.port} (${env.nodeEnv})`);
        });
      }, 1000);
    } else {
      logger.error({ err }, 'Server error');
      process.exit(1);
    }
  });

  server.listen(env.port, '0.0.0.0', () => {
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
