import pino from 'pino';
import { env } from '../config/env.js';

/** Structured logger (§4 utils/logger.js). pino in prod, pretty in dev. */
export const logger = pino({
  level: env.isTest ? 'silent' : env.logLevel,
  ...(env.isProd ? {} : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
});
