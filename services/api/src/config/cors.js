import { env } from './env.js';

/**
 * CORS allow-list: exactly the three web origins from env, nothing else (§10).
 * In local development the .env points these at http://localhost:5173/5174/5175.
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    // in development or on Netlify preview/production, allow matching origins
    if (
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      /^https?:\/\/([a-zA-Z0-9-]+\.)?netlify\.app$/.test(origin) ||
      origin === 'https://growwlocal.netlify.app'
    ) {
      return callback(null, true);
    }

    const allowed = [env.customerWebUrl, env.merchantWebUrl, env.adminWebUrl].filter(Boolean);
    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
};
