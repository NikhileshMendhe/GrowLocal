import { UnauthorizedError } from '../../errors/AppError.js';
import { verifyAccessToken } from '../../utils/jwt.js';

/**
 * Like middleware/authenticate.js but anonymous when no Bearer token is
 * present (§6.4 — GET /products is public, yet an owning merchant must see
 * their own unapproved rows). A presented token that fails verification is
 * still rejected with 401.
 */
export function authenticateOptional(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next();
  }
  try {
    const payload = verifyAccessToken(token);
    req.auth = { type: payload.type, id: payload.sub };
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}
