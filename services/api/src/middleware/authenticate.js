import { UnauthorizedError } from '../errors/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Verifies the JWT from the Authorization header and attaches
 * req.auth = { type, id } (§5). Every authorization decision downstream is
 * based on req.auth — never on any client-supplied id field.
 */
export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing bearer token'));
  }
  try {
    const payload = verifyAccessToken(token);
    req.auth = { type: payload.type, id: payload.sub };
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyAccessToken(token);
      req.auth = { type: payload.type, id: payload.sub };
    } catch {
      req.auth = null;
    }
  } else {
    req.auth = null;
  }
  return next();
}

