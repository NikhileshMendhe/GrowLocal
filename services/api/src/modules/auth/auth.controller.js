import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { ttlToMs } from '../../utils/jwt.js';
import * as authService from './auth.service.js';

/**
 * Controllers pull data off req, call exactly ONE service method, and send
 * the HTTP response (§4.1). No SQL, no business rules.
 */

export const REFRESH_COOKIE = 'gl_refresh_token';

function sessionMeta(req) {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

/**
 * Refresh cookie: httpOnly + Secure + SameSite=None in production so it is
 * sent cross-subdomain (app.growlocal.in → api.growlocal.in) on
 * fetch(..., { credentials: 'include' }) (§5, §8.2).
 * In local dev over http://localhost, browsers reject Secure+None cookies —
 * and localhost:5173 → localhost:4000 is same-site anyway, so Lax is correct.
 */
function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: ttlToMs(env.refreshTokenTtl),
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth', httpOnly: true, sameSite: env.isProd ? 'none' : 'lax' });
}

export const customerSignup = asyncHandler(async (req, res) => {
  const session = await authService.signupCustomer(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken);
  res.status(201).json({ accessToken: session.accessToken, user: session.user });
});

export const customerLogin = asyncHandler(async (req, res) => {
  const session = await authService.loginCustomer(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken);
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const merchantSignup = asyncHandler(async (req, res) => {
  const session = await authService.signupMerchant(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken);
  res.status(201).json({ accessToken: session.accessToken, user: session.user });
});

export const merchantLogin = asyncHandler(async (req, res) => {
  const session = await authService.loginMerchant(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken);
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const session = await authService.loginAdmin(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken);
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const session = await authService.rotate(token, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken);
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(token);
  clearRefreshCookie(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.auth);
  res.json({ user });
});
