/**
 * Seed runner: executes src/db/seeds/*.js in filename order.
 * Each seed exports `async function run(pool)` and must be idempotent.
 *
 * Usage: npm run seed   (from services/, with .env present)
 */
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { pool } from '../src/db/pool.js';
import { logger } from '../src/utils/logger.js';

const here = dirname(fileURLToPath(import.meta.url));
const seedsDir = join(here, '..', 'src', 'db', 'seeds');

async function main() {
  const files = readdirSync(seedsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  for (const file of files) {
    const mod = await import(pathToFileURL(join(seedsDir, file)).href);
    if (typeof mod.run !== 'function') {
      throw new Error(`Seed ${file} does not export a run() function`);
    }
    await mod.run(pool);
    logger.info(`seed: ${file} applied`);
  }

  logger.info(`Seed complete (${files.length} files).`);
  await pool.end();
}

main().catch((error) => {
  logger.error({ err: error }, 'Seed failed');
  process.exit(1);
});
