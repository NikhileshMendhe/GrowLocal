import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import modules from './modules/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { corsOptions } from './config/cors.js';
import { NotFoundError } from './errors/AppError.js';

export function createApp() {
  const app = express();

  // One proxy hop (Render/Railway-style) so req.ip reflects the real client
  // for rate limiting.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/', (_req, res) => res.json({ status: 'ok', service: 'GrowLocal API' }));
  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api', generalLimiter);
  for (const { path, router } of modules) {
    app.use(`/api${path}`, router);
  }

  app.use('/api', (_req, _res, next) => next(new NotFoundError('Route not found')));
  app.use(errorHandler);

  return app;
}
