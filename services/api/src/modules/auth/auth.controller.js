import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { ttlToMs } from '../../utils/jwt.js';
import * as authService from './auth.service.js';

/**
 * Controllers pull data off req, call exactly ONE service method, and send
 * the HTTP response (§4.1). No SQL, no business rules.
 */

export const REFRESH_COOKIE = 'gl_refresh_token';
export const ADMIN_REFRESH_COOKIE = 'gl_admin_refresh_token';
export const CUSTOMER_REFRESH_COOKIE = 'gl_customer_refresh_token';

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
function setRefreshCookie(res, refreshToken, audience = null) {
  const cookieOptions = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: ttlToMs(env.refreshTokenTtl),
  };
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  if (audience === 'admin') {
    res.cookie(ADMIN_REFRESH_COOKIE, refreshToken, cookieOptions);
  } else if (audience === 'customer') {
    res.cookie(CUSTOMER_REFRESH_COOKIE, refreshToken, cookieOptions);
  }
}

function clearRefreshCookie(res, audience = null) {
  const cookieOptions = { path: '/api/auth', httpOnly: true, sameSite: env.isProd ? 'none' : 'lax' };
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  if (audience === 'admin' || !audience) res.clearCookie(ADMIN_REFRESH_COOKIE, cookieOptions);
  if (audience === 'customer' || !audience) res.clearCookie(CUSTOMER_REFRESH_COOKIE, cookieOptions);
}

export const customerSignup = asyncHandler(async (req, res) => {
  const session = await authService.signupCustomer(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken, 'customer');
  res.status(201).json({ accessToken: session.accessToken, user: session.user });
});

export const customerLogin = asyncHandler(async (req, res) => {
  const session = await authService.loginCustomer(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken, 'customer');
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const merchantSignup = asyncHandler(async (req, res) => {
  const session = await authService.signupMerchant(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken, 'merchant');
  res.status(201).json({ accessToken: session.accessToken, user: session.user });
});

export const merchantLogin = asyncHandler(async (req, res) => {
  const session = await authService.loginMerchant(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken, 'merchant');
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const session = await authService.loginAdmin(req.body, sessionMeta(req));
  setRefreshCookie(res, session.refreshToken, 'admin');
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const refresh = asyncHandler(async (req, res) => {
  const audience = req.headers['x-auth-audience'] || req.query?.audience || null;
  let token = null;
  if (audience === 'admin') {
    token = req.cookies?.[ADMIN_REFRESH_COOKIE];
  } else if (audience === 'customer') {
    token = req.cookies?.[CUSTOMER_REFRESH_COOKIE] || req.cookies?.[REFRESH_COOKIE];
  } else {
    token = req.cookies?.[REFRESH_COOKIE] || req.cookies?.[ADMIN_REFRESH_COOKIE] || req.cookies?.[CUSTOMER_REFRESH_COOKIE];
  }

  const session = await authService.rotate(token, sessionMeta(req), audience);
  setRefreshCookie(res, session.refreshToken, session.user?.type);
  res.json({ accessToken: session.accessToken, user: session.user });
});

export const logout = asyncHandler(async (req, res) => {
  const audience = req.headers['x-auth-audience'] || req.query?.audience || null;
  const token =
    (audience === 'admin' ? req.cookies?.[ADMIN_REFRESH_COOKIE] : req.cookies?.[CUSTOMER_REFRESH_COOKIE]) ||
    req.cookies?.[REFRESH_COOKIE];
  await authService.logout(token);
  clearRefreshCookie(res, audience);
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.auth);
  res.json({ user });
});
