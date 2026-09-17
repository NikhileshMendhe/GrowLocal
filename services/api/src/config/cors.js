import { env } from './env.js';

/**
 * CORS allow-list: exactly the three web origins from env, nothing else (§10).
 * In local development the .env points these at http://localhost:5173/5174/5175.
 */
export const corsOptions = {
  origin: [...new Set([env.customerWebUrl, env.merchantWebUrl, env.adminWebUrl])],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
};
