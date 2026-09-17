import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Last-mile Express error handler (§4). Maps AppError subtypes → HTTP status
 * + a consistent JSON error shape. Anything else is logged and reduced to a
 * generic 500 so internals never leak to clients.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'BAD_JSON', message: 'Request body is not valid JSON' },
    });
  }

  // Postgres unique violation → 409
  if (err.code === '23505') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'A record with these values already exists' },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
