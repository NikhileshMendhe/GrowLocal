import { asyncHandler } from '../../utils/asyncHandler.js';
import { UnauthorizedError } from '../../errors/AppError.js';
import { verifyAccessToken } from '../../utils/jwt.js';
import * as searchService from './search.service.js';

// §7.5 — search works for anonymous visitors; a presented-but-invalid token
// is still rejected rather than silently ignored
function optionalAuth(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = verifyAccessToken(token);
    return { type: payload.type, id: payload.sub };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export const run = asyncHandler(async (req, res) => {
  const result = await searchService.run(optionalAuth(req), req.body);
  res.json(result);
});

export const popular = asyncHandler(async (req, res) => {
  const searches = await searchService.popular({ limit: req.query.limit ?? 10 });
  res.json({ searches });
});

export const demandGaps = asyncHandler(async (req, res) => {
  const gaps = await searchService.demandGaps({ limit: req.query.limit ?? 10 });
  res.json({ gaps });
});
