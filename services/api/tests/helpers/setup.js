import http from 'node:http';

/**
 * Boots the real app on an ephemeral port for E2E tests.
 *
 * IMPORTANT: every src/ module must be dynamically imported AFTER the env
 * vars below are set — db/pool.js and config/env.js bind to DATABASE_URL at
 * import time. Test files must statically import ONLY this helper.
 *
 * Each test FILE runs in its own node process (node --test), so per-file
 * database URLs are safe. Run with --test-concurrency=1 when files share a DB.
 */
export async function startTestApp({ databaseUrl } = {}) {
  process.env.NODE_ENV = 'test';
  if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
  process.env.DATABASE_SSL ??= 'false';
  process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
  process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';

  const { createApp } = await import('../../src/app.js');
  const { initSocket, resetSocket } = await import('../../src/realtime/socket.js');
  const { pool } = await import('../../src/db/pool.js');

  resetSocket();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  return {
    server,
    baseUrl,
    pool,
    async stop() {
      resetSocket();
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    },
  };
}

/** Wipes every table (except the migrations ledger) — run between suites. */
export async function truncateAll() {
  const { query } = await import('../../src/db/pool.js');
  const { rows } = await query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'pgmigrations'`
  );
  if (rows.length === 0) return;
  const list = rows.map((row) => `"${row.tablename}"`).join(', ');
  await query(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
}

/** Creates an admin row the way the seed script does (§5 — admins are seeded, never self-registered). */
export async function seedAdmin({ email, password }) {
  const { query } = await import('../../src/db/pool.js');
  const { hashPassword } = await import('../../src/utils/password.js');
  const passwordHash = await hashPassword(password);
  await query(
    `INSERT INTO admins (full_name, email, password_hash, role_name)
     VALUES ('Test Admin', $1, $2, 'super_admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, passwordHash]
  );
}

/** Stateful HTTP client: bearer token + refresh-cookie jar. */
export function makeClient(baseUrl) {
  let token = null;
  let cookie = null;

  async function call(method, path, body) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (cookie) headers.Cookie = cookie;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${baseUrl}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const match = /gl_refresh_token=([^;]+)/.exec(setCookieHeader);
      if (match) cookie = `gl_refresh_token=${match[1]}`;
      else if (/gl_refresh_token=;/.test(setCookieHeader)) cookie = null;
    }

    let data = null;
    if (response.status !== 204) data = await response.json().catch(() => null);
    return { status: response.status, data, setCookie: setCookieHeader };
  }

  return {
    setToken(value) {
      token = value;
    },
    setCookie(value) {
      cookie = value;
    },
    getCookie: () => cookie,
    get: (path) => call('GET', path),
    post: (path, body) => call('POST', path, body),
    patch: (path, body) => call('PATCH', path, body),
    put: (path, body) => call('PUT', path, body),
    delete: (path) => call('DELETE', path),
  };
}
