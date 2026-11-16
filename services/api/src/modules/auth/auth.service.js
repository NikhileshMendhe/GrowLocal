import * as repository from './auth.repository.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  newJti,
  hashToken,
  ttlToMs,
} from '../../utils/jwt.js';
import { env } from '../../config/env.js';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../../errors/AppError.js';

/**
 * Auth business rules (§5): hashing, token issuing/rotation, audience
 * separation. Three audiences, three tables, NO shared login endpoint —
 * customer code can never accidentally know about merchant auth.
 */

function sanitize(row) {
  if (!row) return row;
  const { password_hash, ...safe } = row;
  return safe;
}

function refreshExpiryDate() {
  return new Date(Date.now() + ttlToMs(env.refreshTokenTtl));
}

/** Issues an access token + a NEW refresh token (persisted by hash). */
async function issueSession(ownerType, ownerId, meta) {
  const jti = newJti();
  const refreshToken = signRefreshToken({ id: ownerId, type: ownerType, jti });
  await repository.insertRefreshToken({
    ownerType,
    ownerId,
    tokenHash: hashToken(jti),
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
    expiresAt: refreshExpiryDate(),
  });
  const accessToken = signAccessToken({ id: ownerId, type: ownerType });
  return { accessToken, refreshToken };
}

export async function signupCustomer(input, meta) {
  const existing = await repository.findCustomerByEmail(input.email);
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }
  const passwordHash = await hashPassword(input.password);
  const customer = await repository.createCustomer({ ...input, passwordHash });
  const session = await issueSession('customer', customer.id, meta);
  return { ...session, user: customer };
}

export async function loginCustomer(input, meta) {
  const row = await repository.findCustomerByEmail(input.email);
  if (!row || !(await verifyPassword(input.password, row.password_hash))) {
    throw new UnauthorizedError('Invalid email or password');
  }
  if (row.status !== 'active') {
    throw new UnauthorizedError('This account is not active');
  }
  await repository.touchCustomerLastActive(row.id);
  const session = await issueSession('customer', row.id, meta);
  return { ...session, user: sanitize(row) };
}

export async function signupMerchant(input, meta) {
  const existing = await repository.findMerchantByEmail(input.email);
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }
  const passwordHash = await hashPassword(input.password);
  const merchant = await repository.createMerchant({ ...input, passwordHash });
  const session = await issueSession('merchant', merchant.id, meta);
  return { ...session, user: merchant };
}

export async function loginMerchant(input, meta) {
  const row = await repository.findMerchantByEmail(input.email);
  if (!row || !(await verifyPassword(input.password, row.password_hash))) {
    throw new UnauthorizedError('Invalid email or password');
  }
  if (row.status === 'blocked' || row.status === 'suspended') {
    throw new UnauthorizedError('This account is not active');
  }
  const session = await issueSession('merchant', row.id, meta);
  return { ...session, user: sanitize(row) };
}

export async function loginAdmin(input, meta) {
  const row = await repository.findAdminByEmail(input.email);
  if (!row || !(await verifyPassword(input.password, row.password_hash))) {
    throw new UnauthorizedError('Invalid email or password');
  }
  const session = await issueSession('admin', row.id, meta);
  return {
    ...session,
    user: {
      ...sanitize(row),
      type: 'admin',
      role_name: row.role_name || 'admin',
      role: 'admin',
    },
  };
}

/**
 * Refresh-token rotation (§5): verifies the JWT, checks the persisted hash
 * row (not revoked, not expired), then atomically revokes it and issues a
 * replacement. Reuse of an already-rotated token is rejected — a stolen
 * refresh token stops working the moment the legitimate client refreshes.
 */
export async function rotate(rawRefreshToken, meta, expectedType = null) {
  if (!rawRefreshToken) {
    throw new UnauthorizedError('Missing refresh token');
  }
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (expectedType && payload.type !== expectedType) {
    throw new UnauthorizedError('Invalid session audience');
  }

  const tokenHash = hashToken(payload.jti);
  const stored = await repository.findRefreshTokenByHash(tokenHash);
  if (!stored || stored.revoked_at || new Date(stored.expires_at) < new Date()) {
    throw new UnauthorizedError('Refresh token is no longer valid');
  }

  const jti = newJti();
  const rotated = await repository.rotateRefreshToken({
    tokenHash,
    ownerType: payload.type,
    ownerId: payload.sub,
    newTokenHash: hashToken(jti),
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
    expiresAt: refreshExpiryDate(),
  });
  if (!rotated) {
    throw new UnauthorizedError('Refresh token already used');
  }

  const refreshToken = signRefreshToken({ id: payload.sub, type: payload.type, jti });
  const accessToken = signAccessToken({ id: payload.sub, type: payload.type });
  const rawUser = await getUser(payload.type, payload.sub);
  const user = sanitize(rawUser);
  return {
    accessToken,
    refreshToken,
    user: {
      ...user,
      type: payload.type,
      role_name: user?.role_name || (payload.type === 'admin' ? 'admin' : undefined),
      role: user?.role_name || payload.type,
    },
  };
}

export async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return false;
  try {
    const payload = verifyRefreshToken(rawRefreshToken);
    return repository.revokeRefreshToken(hashToken(payload.jti));
  } catch {
    return false; // already-expired JWT: nothing to revoke
  }
}

async function getUser(type, id) {
  if (type === 'customer') return repository.findCustomerById(id);
  if (type === 'merchant') return repository.findMerchantById(id);
  if (type === 'admin') return repository.findAdminById(id);
  throw new UnauthorizedError('Unknown token audience');
}

/** GET /auth/me — returns the caller's own row, discriminated by req.auth.type. */
export async function getMe(auth) {
  const user = await getUser(auth.type, auth.id);
  if (!user) throw new NotFoundError('Account not found');
  return {
    ...user,
    type: auth.type,
    role_name: user?.role_name || (auth.type === 'admin' ? 'admin' : undefined),
    role: user?.role_name || auth.type,
  };
}
