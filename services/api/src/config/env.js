import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env'), override: true });
dotenv.config();

/**
 * Reads & validates process.env ONCE. Fail fast on missing required vars (§4).
 * Import this module before anything that needs configuration; a missing
 * required variable terminates the process with a clear message.
 */

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`[env] Missing required environment variable: ${name}`);
    console.error('[env] Copy services/api/.env.example to .env and fill it in.');
    process.exit(1);
  }
  return value;
}

function optional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: Number(optional('PORT', '4000')),
  logLevel: optional('LOG_LEVEL', 'info'),

  databaseUrl: required('DATABASE_URL'),
  databaseSsl: optional('DATABASE_SSL', 'false') === 'true',

  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  accessTokenTtl: optional('ACCESS_TOKEN_TTL', '15m'),
  refreshTokenTtl: optional('REFRESH_TOKEN_TTL', '30d'),

  customerWebUrl: optional('CUSTOMER_WEB_URL', 'http://localhost:5173'),
  merchantWebUrl: optional('MERCHANT_WEB_URL', 'http://localhost:5174'),
  adminWebUrl: optional('ADMIN_WEB_URL', 'http://localhost:5175'),
  adminEmail: optional('GROWLOCAL_ADMIN_EMAIL', optional('ADMIN_EMAIL', 'growlocal.ngp@gmail.com')),

  s3: {
    endpoint: process.env.S3_ENDPOINT || null,
    region: optional('S3_REGION', 'auto'),
    accessKeyId: process.env.S3_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || null,
    bucketPrefix: optional('S3_BUCKET_PREFIX', 'growlocal-'),
  },

  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL || null,
    password: process.env.SEED_ADMIN_PASSWORD || null,
  },
};
