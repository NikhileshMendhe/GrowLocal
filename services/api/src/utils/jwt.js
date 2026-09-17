import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Access tokens: short-lived (15m), carried in Authorization: Bearer.
 * Refresh tokens: long-lived (30d), JWT with a unique jti; only sha256(jti)
 * is persisted in refresh_tokens so a leaked DB dump cannot mint tokens (§5).
 */
export function signAccessToken({ id, type }) {
  return jwt.sign({ sub: id, type }, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function signRefreshToken({ id, type, jti }) {
  return jwt.sign({ sub: id, type, jti }, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export function newJti() {
  return crypto.randomUUID();
}

/** sha256 hex digest — used to store/lookup refresh + reset token hashes. */
export function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function ttlToMs(ttl) {
  const match = /^(\d+)([smhd])$/.exec(String(ttl).trim());
  if (!match) throw new Error(`Invalid TTL format: ${ttl} (expected e.g. '15m', '30d')`);
  const [, amount, unit] = match;
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return Number(amount) * factor;
}
