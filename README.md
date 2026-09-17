# GrowLocal

Local-commerce platform: customer storefront, merchant dashboard, and admin console backed by a Node.js/Express + Postgres API with Socket.IO realtime.

npm-workspaces monorepo. The original Vite SPA (pre-migration) still lives in `src/` and runs via `npm run dev:legacy`.

## Structure

| Path | Purpose |
| --- | --- |
| `services/api` | Express + Postgres REST API (JWT auth, per-module repository pattern, Socket.IO realtime) |
| `apps/customer-web` | Customer storefront — React + Vite |
| `apps/merchant-web` | Merchant dashboard — React + Vite |
| `apps/admin-web` | Admin console — React + Vite |
| `packages/api-client` | Shared API route contract + HTTP / Socket.IO client primitives |
| `packages/ui` | Shared React UI components |
| `packages/config` | Shared ESLint / Tailwind config |
| `src/` | Legacy Vite SPA (pre-migration, untouched) |
| `docs/` | Architecture documentation |

## Prerequisites

- Node.js >= 20
- Postgres — any instance works; use the **direct connection string** (not PostgREST). Local development currently runs against a Supabase Postgres container on `:54322`.

## Setup

```bash
npm install
```

Point the API at a database and run migrations + seeds:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:54322/growlocal

npm run db:migrate
npm run db:seed
```

Seeds create reference data (categories, locations, subscription plans, homepage sections) and the initial admin account — the only path that ever creates an `admins` row. Credentials come from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`; local-dev defaults live in `services/api/src/db/seeds/003_admin.js`.

## Environment

- **API** — copy `services/api/.env.example` → `services/api/.env`. In practice only `DATABASE_URL` is required; the rest have development defaults (JWT secrets, CORS origins, optional S3 settings — leaving S3 unset disables the uploads module, which then returns 503 NotConfigured).
- **Frontends** — copy `apps/*/.env.example` → `apps/*/.env` (`VITE_API_BASE_URL`, `VITE_WS_URL`).

Full variable reference: `docs/NODE_BACKEND_ARCHITECTURE.md` §9.

## Development

```bash
npm run dev            # API + customer + merchant, concurrently
npm run dev:api        # API              → http://localhost:4000
npm run dev:customer   # storefront       → http://localhost:5173
npm run dev:merchant   # merchant app     → http://localhost:5174
npm run dev:admin      # admin console    → http://localhost:5175
npm run dev:legacy     # legacy Vite SPA  → http://localhost:3000
```

API health check: `GET /api/health`.

## Testing

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:54322/growlocal_test
npm run test:api
```

Integration suite exercising the real HTTP app + Postgres (`node --test`, run serially). Migrate the target database first if it is fresh (`npm run db:migrate` with the same `DATABASE_URL`). Test files truncate their tables — always point the suite at a scratch database, never production. Without an explicit override, test files fall back to per-module `growlocal_w{a…d}` databases on localhost.

## Production builds

```bash
npm run build:customer
npm run build:merchant
npm run build:admin
npm run build:legacy
```

## Architecture

`docs/NODE_BACKEND_ARCHITECTURE.md` is the source of truth for the API surface, data model, auth flows, and realtime event contracts. The shared route contract consumed by every frontend lives in `packages/api-client/src/endpoints.js`.
