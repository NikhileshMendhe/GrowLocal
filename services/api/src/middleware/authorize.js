import { ForbiddenError } from '../errors/AppError.js';

/**
 * Role check — authorization check #1 of the always-both pattern (§7.3).
 * Usage: router.post('/', authenticate, requireRole('merchant'), controller)
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new ForbiddenError('Authentication required'));
    }
    if (!roles.includes(req.auth.type)) {
      return next(new ForbiddenError(`This endpoint requires role: ${roles.join(' or ')}`));
    }
    return next();
  };
}
