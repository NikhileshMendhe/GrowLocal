/**
 * Migration runner wrapper: loads .env, then delegates to node-pg-migrate's
 * programmatic runner (the CLI binary does not read .env files).
 *
 * Usage: npm run migrate            (apply all pending)
 *        npm run migrate:down       (revert the latest one)
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runner } from 'node-pg-migrate';

import { env } from '../src/config/env.js';

const here = dirname(fileURLToPath(import.meta.url));
const direction = process.argv[2] === 'down' ? 'down' : 'up';

await runner({
  databaseUrl: {
    connectionString: env.databaseUrl,
    ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
  },
  dir: join(here, '..', 'src', 'db', 'migrations'),
  direction,
  count: direction === 'down' ? 1 : Infinity,
  log: true,
});
