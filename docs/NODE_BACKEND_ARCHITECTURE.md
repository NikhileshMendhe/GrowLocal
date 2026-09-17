# GrowLocal — Node.js Backend Migration Architecture

**Audience:** an AI coding agent (or engineer) implementing this from scratch. Read this whole document before writing code. It assumes zero prior context beyond what's written here and what's in this repo today.

**Status:** implemented. Phases 0–3 of §11 are complete — the monorepo (`services/api`, `apps/*`, `packages/*`) exists in code with the full §6 API surface, §7.5 realtime, and a green integration suite (`npm run test:api`, 225 tests). Phase 4 (cutover) is pending — the legacy `src/` app is untouched and runs via `npm run dev:legacy`. "(existing)" markers below refer to pre-migration legacy code.

---

## 0. What exists today (read this first)

The current app is a single Vite + React SPA (`src/`) that talks directly to Supabase (Postgres + Auth + Realtime + Storage) from the browser using `@supabase/supabase-js`. There is no backend server — "the API" is Supabase's auto-generated PostgREST layer plus Row Level Security (RLS) policies, called straight from `src/services/*.js`.

Three "platforms" — customer, merchant, admin — live in one bundle (`src/App.jsx`, 2700+ lines) and are separated only by client-side JS route guards (`activePlatform` state + `if (currentUser.role === 'merchant') ...`). All three ship to every visitor.

The full current Postgres schema is in [`supabase/schema.sql`](../supabase/schema.sql) (~28 tables) plus incremental fixes in [`supabase/migrations/`](../supabase/migrations/). That file is the most accurate record of "what data we actually have" and is the baseline for the new schema in this document.

### Known root cause: "merchant adds a product, customer doesn't see it"

This bug is a direct consequence of the current architecture, not a one-line fix. Three compounding causes, all in `src/services/productService.js` / `shopService.js`:

1. **Client-side caching with no reliable invalidation.** Every service keeps a module-level `inMemoryProductsCache` (60s TTL) *and* a `localStorage` copy (`growlocal_cached_real_products`). A customer tab that loaded the catalog within the last 60 seconds will not re-query Supabase even if `subscribeToProducts` fires — and `subscribeToProducts` itself is a no-op (`if (!isSupabaseConfigured) return () => {}`) whenever env vars aren't wired for that build, which silently disables live updates with no error surfaced anywhere.
2. **Two independent "is this real" heuristics.** `getCachedProducts()` only trusts a cached row if `isUuid(p.id)`, and `App.jsx` has a startup routine that scans `localStorage` for hardcoded strings (`'TechZone Electronics'`, `'prod-1'`) to decide whether to nuke the cache. Any product whose shape doesn't match these ad-hoc heuristics is silently dropped or silently kept stale — there is no single source of truth.
3. **RLS is the only access boundary, and it's easy to fail closed silently.** `products` are publicly readable only `WHERE approval_status = 'approved'`; a merchant's insert depends on a join chain `products → shops → merchants → profiles → auth.uid()` (see `20260904000000_merchant_user_auth_sync.sql`). If the `profiles` row for a newly-signed-up merchant hasn't been created yet (auth trigger timing), the shop/product insert can fail RLS with an error that the current code often swallows (`catch (e) {}`) instead of surfacing.

**The fix is architectural, not a patch:** move all reads/writes behind one backend API that is the single source of truth, remove client-side TTL caches in favor of short-lived in-request data only, and push change notifications over a WebSocket connection from the same request handler that performed the write (see §7.5). This structurally closes the staleness window instead of shortening it.

---

## 1. Target architecture

Three independently deployable frontends/services, one shared Postgres database, one object store for images/files:

```
                     ┌─────────────────────────┐
                     │   apps/customer-web      │  Vite React SPA
                     │   (search, shop pages,   │  deployed on its own domain/site
                     │   orders, chat, profile) │  e.g. app.growlocal.in
                     └───────────┬──────────────┘
                                 │ HTTPS (REST) + WSS (Socket.IO)
                                 ▼
                     ┌─────────────────────────┐
                     │   apps/merchant-web      │  Vite React SPA
                     │   (dashboard, products,  │  deployed on its own domain/site
                     │   orders, chat, shop)    │  e.g. merchant.growlocal.in
                     └───────────┬──────────────┘
                                 │ HTTPS (REST) + WSS (Socket.IO)
                                 ▼
                     ┌─────────────────────────┐
                     │   services/api           │  Node.js + Express
                     │   (the ONLY thing that   │  deployed as one process
                     │   talks to Postgres)     │  e.g. api.growlocal.in
                     └───────────┬──────────────┘
                                 │ pg (TLS)
                                 ▼
                     ┌─────────────────────────┐
                     │   PostgreSQL              │  managed instance
                     └─────────────────────────┘
                     ┌─────────────────────────┐
                     │   Object storage (S3-     │  product/shop/avatar images,
                     │   compatible: R2/S3/MinIO)│  verification docs, chat attachments
                     └─────────────────────────┘
```

**Deliberate deviation from the whiteboard sketch:** the sketch shows the merchant frontend reading "live orders" directly from the DB. **Do not do this.** A static frontend must never hold a database connection string or credential — that's a full data-exfiltration and write-access exposure the moment someone opens devtools. It also reintroduces the exact staleness/cache problem this migration exists to fix, just moved to a different tier. Instead: the merchant-web app opens a WebSocket to `services/api`, joins a room scoped to its shop, and the API emits `order:new` / `order:updated` events over that socket in the same request handler that writes the row (§7.5). Same guarantees the sketch wanted ("live orders"), none of the risk.

Admin panel (`src/views/admin/*`, 25+ views — currently bundled into the same SPA) is out of scope for phase 1 of this migration. It should eventually become `apps/admin-web`, a fourth deployable following the exact same pattern as customer/merchant. See §11 Phase 3.

---

## 2. Monorepo layout

npm workspaces, one repo, three independently buildable/deployable units plus shared packages.

```
GrowLocal/
├── package.json                     # workspaces: ["apps/*", "packages/*", "services/*"]
├── docs/
│   └── NODE_BACKEND_ARCHITECTURE.md  # this file
│
├── apps/
│   ├── customer-web/                 # customer-facing SPA — NO merchant code, NO merchant routes
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── .env.example              # VITE_API_BASE_URL, VITE_WS_URL
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.jsx
│   │       ├── App.jsx               # customer routes ONLY (home, search, shop, product, chat, orders, profile)
│   │       ├── pages/
│   │       │   ├── Home.jsx
│   │       │   ├── Search.jsx
│   │       │   ├── Categories.jsx
│   │       │   ├── SearchResults.jsx
│   │       │   ├── ShopProfile.jsx
│   │       │   ├── ProductDetails.jsx
│   │       │   ├── Chat.jsx
│   │       │   ├── Enquiries.jsx
│   │       │   ├── Orders.jsx        # replaces CustomerReservations
│   │       │   ├── SavedShops.jsx
│   │       │   ├── Profile.jsx
│   │       │   ├── PrivacySecurity.jsx
│   │       │   └── HelpSupport.jsx
│   │       ├── components/           # customer-only components (BuyNowModal, DemandRequestModal, AdvanceSearchBar, ...)
│   │       ├── context/
│   │       │   ├── AuthContext.jsx   # customer session only
│   │       │   └── SocketContext.jsx
│   │       ├── hooks/
│   │       │   └── useLiveCatalog.js # subscribes to catalog socket events, no localStorage cache
│   │       └── lib/
│   │           └── apiClient.js      # thin wrapper around packages/api-client, sets customer auth header
│   │
│   ├── merchant-web/                 # merchant-facing SPA — NO customer search/discovery code
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.jsx
│   │       ├── App.jsx               # merchant routes ONLY
│   │       ├── pages/
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Products.jsx
│   │       │   ├── Orders.jsx        # replaces MerchantEnquiries + reservation views
│   │       │   ├── Chats.jsx
│   │       │   ├── ShopProfile.jsx
│   │       │   ├── Analytics.jsx
│   │       │   ├── Offers.jsx
│   │       │   ├── Subscription.jsx
│   │       │   ├── CreatorCampaigns.jsx
│   │       │   └── OnboardingWizard.jsx
│   │       ├── components/
│   │       ├── context/
│   │       │   ├── AuthContext.jsx   # merchant session only
│   │       │   └── SocketContext.jsx
│   │       └── lib/
│   │           └── apiClient.js
│   │
│   └── admin-web/                    # PHASE 3 — placeholder only for now, see §11
│
├── packages/
│   ├── ui/                           # shared *dumb* presentational components, no data fetching
│   │   └── src/ (Toast.jsx, Rating.jsx, VerifiedBadge.jsx, Modal.jsx, ...)
│   ├── api-client/                   # generated/typed fetch client shared by customer-web & merchant-web
│   │   └── src/
│   │       ├── http.js               # fetch wrapper: base URL, auth header injection, error normalization
│   │       ├── endpoints.js          # path constants, one per API route in §8
│   │       └── sockets.js            # Socket.IO client factory + typed event names
│   └── config/                       # shared eslint/prettier/tailwind config
│
├── services/
│   └── api/                          # THE Node.js backend — see full breakdown in §7
│       ├── package.json
│       ├── .env.example
│       └── src/ ...
│
└── (legacy) src/                     # current monolith — deleted at the end of Phase 4, see §11
```

Root `package.json` scripts an implementing agent should wire up:

```json
{
  "scripts": {
    "dev:api": "npm run dev --workspace=services/api",
    "dev:customer": "npm run dev --workspace=apps/customer-web",
    "dev:merchant": "npm run dev --workspace=apps/merchant-web",
    "dev": "concurrently \"npm:dev:api\" \"npm:dev:customer\" \"npm:dev:merchant\"",
    "build:customer": "npm run build --workspace=apps/customer-web",
    "build:merchant": "npm run build --workspace=apps/merchant-web",
    "db:migrate": "npm run migrate --workspace=services/api",
    "db:seed": "npm run seed --workspace=services/api"
  }
}
```

---

## 3. Database design

**Engine:** PostgreSQL (unchanged — you can literally keep the existing Supabase Postgres instance and just stop using Supabase Auth/PostgREST/RLS/Storage, pointing `pg` at its connection string; or move to Neon/Railway/RDS. Either way the schema below is the target).

**DB access layer choice:** plain [`node-postgres`](https://node-postgres.com/) (`pg`) with a **Repository pattern**, migrations run via [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate). Rationale, spelled out because "just use an ORM" is the obvious alternative and was deliberately rejected: the existing schema leans on Postgres-native features (triggers, `CHECK` constraints, a custom Haversine function) that map awkwardly onto ORM schema files (Prisma in particular has no first-class `CHECK` constraint or trigger support). Raw SQL migrations plus a thin repository layer keep those features first-class, keep the DB layer transparent for the next agent to extend, and match "follow RDBMS structure" literally rather than through an abstraction.

### 3.1 Entity groups and what changed vs. the old schema

| Group | Tables | Change from `supabase/schema.sql` |
|---|---|---|
| Identity | `customers`, `merchants`, `admins`, `refresh_tokens`, `password_reset_tokens` | **Biggest change.** Old schema had one `profiles` table with a `role` column, plus `auth.users` owned by Supabase Auth. That's gone. Each audience now owns its own table with its own `password_hash` — this is what you asked for explicitly ("Customers table"), and it structurally enforces "no merchant fields leak into customer code" because there's no shared user shape to leak. |
| Catalog | `categories`, `locations`, `shops`, `shop_hours`, `shop_photos`, `shop_verifications`, `products`, `product_variants`, `product_images` | Same shape as before, FKs repointed at `merchants.id` instead of `profiles.id`. |
| Commerce | `orders`, `enquiries`, `offers` | **Second big change.** Old schema had `enquiries` + `reservations` + ad-hoc "Buy Now" objects that only ever existed in `localStorage` (see `src/services/enquiryService.js` — it literally string-parses `₹1,500` back into a number). `reservations` is gone; **`orders`** is the one real table for anything a customer has committed to buying, exactly as you asked ("Orders table, foreign key to Customers"). `enquiries`/`offers` remain as the pre-purchase negotiation thread and now feed into `orders` instead of duplicating it. |
| Conversation | `conversations`, `messages` | Same shape, FKs repointed. |
| Social proof | `reviews`, `review_reports`, `saved_shops` | Same shape, FKs repointed. |
| Demand intel | `demand_requests`, `demand_responses`, `search_history` | Same shape, FKs repointed. |
| Notifications | `notifications` | `user_id` → polymorphic `recipient_type` + `recipient_id`, because recipients can now be customers, merchants, or admins from three different tables. |
| Monetization | `subscription_plans`, `merchant_subscriptions`, `payments` | Same shape, `payments.order_id` added (old schema only had `reservation_id`). |
| Growth | `creators`, `campaigns`, `campaign_creators`, `campaign_metrics` | Same shape, FKs repointed at `merchants.id`. |
| CMS / ops | `homepage_sections`, `audit_logs` | Same shape, `audit_logs.admin_id` → `admins.id`. |

### 3.2 Full DDL

This is the target schema, adapted from `supabase/schema.sql`. Save as `services/api/src/db/migrations/001_init.sql` (or as the first `node-pg-migrate` migration).

```sql
-- ============================================================================
-- EXTENSIONS & SHARED HELPERS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. IDENTITY — customers, merchants, admins each own their auth directly.
--    No shared "profiles" table. No Supabase auth.users dependency.
-- ============================================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  location_id UUID,               -- FK added below after locations exists
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_customers_email ON customers(email);

CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  business_description TEXT,
  business_category_id UUID,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'blocked')),
  verification_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected')),
  gstin VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_merchants_email ON merchants(email);

-- Admins are seeded manually (psql / a one-off script), never via public signup.
-- This removes the hardcoded super-admin password that currently lives in
-- src/services/authService.js (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD).
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_name VARCHAR(100) NOT NULL DEFAULT 'admin' CHECK (role_name IN ('admin', 'super_admin')),
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- One shared token table for all three audiences, discriminated by owner_type.
-- token_hash = sha256(raw refresh token); never store the raw token.
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('customer', 'merchant', 'admin')),
  owner_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address VARCHAR(50),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_owner ON refresh_tokens(owner_type, owner_id);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('customer', 'merchant', 'admin')),
  owner_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. LOCATIONS
-- ============================================================================

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(20),
  area VARCHAR(150) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE customers ADD CONSTRAINT fk_customers_location
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. CATALOG — categories, shops, products
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE merchants ADD CONSTRAINT fk_merchants_category
  FOREIGN KEY (business_category_id) REFERENCES categories(id) ON DELETE SET NULL;

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Nagpur',
  state VARCHAR(100) DEFAULT 'Maharashtra',
  pincode VARCHAR(20),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  price_min NUMERIC(10, 2) DEFAULT 0,
  price_max NUMERIC(10, 2) DEFAULT 100000,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'temporarily_closed', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_shops_merchant_id ON shops(merchant_id);
CREATE INDEX idx_shops_status ON shops(status);

CREATE TABLE shop_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  opening_time TIME,
  closing_time TIME,
  is_open BOOLEAN DEFAULT TRUE
);

CREATE TABLE shop_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  documents JSONB DEFAULT '[]'::jsonb,
  verification_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  discount_percentage INT DEFAULT 0,
  availability_status VARCHAR(50) DEFAULT 'In Stock' CHECK (availability_status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  stock_quantity INT DEFAULT 10,
  is_featured BOOLEAN DEFAULT FALSE,
  approval_status VARCHAR(50) DEFAULT 'approved' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_approval_status ON products(approval_status);
CREATE INDEX idx_products_category_id ON products(category_id);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  sku VARCHAR(100),
  price NUMERIC(10, 2),
  stock_quantity INT DEFAULT 5,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. COMMERCE — enquiries (negotiation) → offers (merchant response) → orders
--    (committed purchase). This replaces the old enquiries+reservations
--    localStorage-duplicated mess.
-- ============================================================================

CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_code VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  requested_size VARCHAR(50),
  requested_color VARCHAR(50),
  budget VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'offer_sent', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_enquiries_updated_at BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_enquiries_customer_id ON enquiries(customer_id);
CREATE INDEX idx_enquiries_shop_id ON enquiries(shop_id);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  discount VARCHAR(50),
  message TEXT,
  expires_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- The ONE table for anything a customer has committed to buying — direct
-- "Buy Now", in-store "Reserve", or an accepted Offer all land here.
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code VARCHAR(50) UNIQUE NOT NULL,             -- e.g. GL-ORD-48213, shown to the customer
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,  -- denormalized for O(1) merchant order feed
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,   -- set if this order came out of a negotiation
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  origin VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (origin IN ('direct', 'offer_accepted')),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  fulfillment_type VARCHAR(20) NOT NULL DEFAULT 'pickup' CHECK (fulfillment_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN (
    'pending_confirmation', 'confirmed', 'ready_for_pickup', 'out_for_delivery',
    'completed', 'rejected_by_merchant', 'cancelled_by_customer', 'expired'
  )),
  payment_method VARCHAR(50) DEFAULT 'pay_at_store',
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  pickup_or_delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================================
-- 5. CONVERSATIONS & MESSAGES
-- ============================================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'archived', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX uq_conversation_customer_shop ON conversations(customer_id, shop_id);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'merchant', 'admin')),
  sender_id UUID NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'product', 'offer', 'order', 'system')),
  message_text TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- ============================================================================
-- 6. REVIEWS & SAVED SHOPS
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'removed', 'reported')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE review_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reported_by_customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_saved_shops UNIQUE (customer_id, shop_id)
);

-- ============================================================================
-- 7. DEMAND INTELLIGENCE
-- ============================================================================

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  search_query TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE demand_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  budget VARCHAR(50),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  radius_km NUMERIC(5, 2) DEFAULT 3.0,
  description TEXT,
  status VARCHAR(50) DEFAULT 'broadcasted' CHECK (status IN ('broadcasted', 'fulfilled', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_demand_requests_updated_at BEFORE UPDATE ON demand_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE demand_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demand_request_id UUID NOT NULL REFERENCES demand_requests(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  price NUMERIC(10, 2),
  availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'unavailable', 'alternative')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. NOTIFICATIONS & ANALYTICS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('customer', 'merchant', 'admin')),
  recipient_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_type VARCHAR(20) CHECK (actor_type IN ('customer', 'merchant', 'admin', 'anonymous')),
  actor_id UUID,
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. MONETIZATION
-- ============================================================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  billing_interval VARCHAR(50) DEFAULT 'month',
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE merchant_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'trial', 'past_due', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_merchant_subscriptions_updated_at BEFORE UPDATE ON merchant_subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES merchant_subscriptions(id) ON DELETE SET NULL,
  campaign_id UUID,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_type VARCHAR(100) NOT NULL,
  payment_gateway VARCHAR(50) DEFAULT 'Razorpay',
  gateway_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 10. GROWTH — creators & campaigns
-- ============================================================================

CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  category VARCHAR(100),
  profile_image TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  followers VARCHAR(50),
  engagement_rate VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_creators_updated_at BEFORE UPDATE ON creators FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget NUMERIC(10, 2) NOT NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE campaign_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'accepted',
  agreed_amount NUMERIC(10, 2)
);

CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  reach INT DEFAULT 0,
  clicks INT DEFAULT 0,
  enquiries INT DEFAULT 0,
  orders INT DEFAULT 0,
  visits INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. CMS & AUDIT (admin-only, phase 3)
-- ============================================================================

CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. GEOSPATIAL HELPER (kept from the old schema — still useful, DB-native)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_distance(lat1 NUMERIC, lon1 NUMERIC, lat2 NUMERIC, lon2 NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  rad_lat1 NUMERIC := radians(lat1); rad_lon1 NUMERIC := radians(lon1);
  rad_lat2 NUMERIC := radians(lat2); rad_lon2 NUMERIC := radians(lon2);
  dlat NUMERIC := rad_lat2 - rad_lat1; dlon NUMERIC := rad_lon2 - rad_lon1;
  a NUMERIC; c NUMERIC; r NUMERIC := 6371;
BEGIN
  a := sin(dlat/2)^2 + cos(rad_lat1) * cos(rad_lat2) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN round(r * c, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: when a shop_verification is approved, flip shop + merchant status
CREATE OR REPLACE FUNCTION sync_shop_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE shops SET is_verified = TRUE WHERE id = NEW.shop_id;
    UPDATE merchants SET verification_status = 'approved' WHERE id = NEW.merchant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_shop_verification
AFTER INSERT OR UPDATE ON shop_verifications
FOR EACH ROW EXECUTE FUNCTION sync_shop_verification();
```

**No RLS policies in this schema.** Access control moves entirely into the API layer (§7.3) — the API connects with one application-owned DB role that has full read/write on its own schema, and every authorization decision (can this merchant edit this shop? can this customer read this order?) happens in Express middleware/controllers, not in Postgres policies. This is a deliberate simplification: RLS made sense when the browser talked to Postgres directly; now nothing but `services/api` ever opens a DB connection, so the browser can no longer bypass a policy by construction.

---

## 4. Backend service (`services/api`) — full file structure

Layered as **routes → controllers → services → repositories**, one folder per domain ("module") so the next agent can add a whole new domain by copying a folder:

```
services/api/
├── package.json
├── .env.example
├── src/
│   ├── index.js                      # process entrypoint: create http server, attach Express app + Socket.IO, listen
│   ├── app.js                        # express() instance: helmet, cors, json body parser, route mounting, error handler
│   │
│   ├── config/
│   │   ├── env.js                    # reads & validates process.env once (fail fast on missing vars)
│   │   └── cors.js                   # allowed origins = [CUSTOMER_WEB_URL, MERCHANT_WEB_URL, ADMIN_WEB_URL]
│   │
│   ├── db/
│   │   ├── pool.js                   # single `pg.Pool` instance, exported
│   │   ├── migrations/
│   │   │   └── 001_init.sql          # the DDL in §3.2 (node-pg-migrate compatible)
│   │   └── seeds/
│   │       ├── 001_categories.js
│   │       ├── 002_locations.js
│   │       └── 003_admin.js          # seeds one super_admin row with a bcrypt hash from env vars, not source code
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js        # POST /customer/signup, /customer/login, /merchant/signup, /merchant/login, /admin/login, POST /refresh, POST /logout, GET /me
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js       # hashing, token issuing/rotation, business rules
│   │   │   ├── auth.repository.js    # raw SQL against customers/merchants/admins/refresh_tokens
│   │   │   └── auth.validation.js    # zod schemas for signup/login bodies
│   │   │
│   │   ├── customers/
│   │   │   ├── customers.routes.js   # GET/PATCH /customers/me
│   │   │   ├── customers.controller.js
│   │   │   ├── customers.service.js
│   │   │   └── customers.repository.js
│   │   │
│   │   ├── merchants/
│   │   │   ├── merchants.routes.js   # GET/PATCH /merchants/me, GET /merchants/me/shop
│   │   │   ├── merchants.controller.js
│   │   │   ├── merchants.service.js
│   │   │   └── merchants.repository.js
│   │   │
│   │   ├── shops/
│   │   │   ├── shops.routes.js       # GET /shops (public list+search), GET /shops/:id (public), POST/PATCH/DELETE /shops (merchant)
│   │   │   ├── shops.controller.js
│   │   │   ├── shops.service.js
│   │   │   └── shops.repository.js
│   │   │
│   │   ├── products/
│   │   │   ├── products.routes.js    # GET /products (public list+filter+search), GET /products/:id, POST/PATCH/DELETE /products (merchant)
│   │   │   ├── products.controller.js
│   │   │   ├── products.service.js   # emits socket events on create/update/delete — this is what fixes the bug
│   │   │   └── products.repository.js
│   │   │
│   │   ├── categories/
│   │   │   └── ... (routes/controller/service/repository)
│   │   │
│   │   ├── orders/
│   │   │   ├── orders.routes.js      # POST /orders (customer createOrder), GET /orders/mine (customer), GET /orders/shop (merchant), PATCH /orders/:id/status (merchant)
│   │   │   ├── orders.controller.js
│   │   │   ├── orders.service.js     # order state machine, stock decrement, socket emit to shop room + customer room
│   │   │   └── orders.repository.js
│   │   │
│   │   ├── enquiries/
│   │   │   └── ... # POST /enquiries (customer), GET /enquiries/mine, GET /enquiries/shop, PATCH /enquiries/:id/status
│   │   │
│   │   ├── offers/
│   │   │   └── ... # POST /offers (merchant responds), POST /offers/:id/accept (customer → creates an order)
│   │   │
│   │   ├── conversations/
│   │   │   ├── conversations.routes.js  # GET /conversations, GET /conversations/:id/messages, POST /conversations/:id/messages
│   │   │   ├── conversations.controller.js
│   │   │   ├── conversations.service.js # persists message, emits over socket to conversation room
│   │   │   └── conversations.repository.js
│   │   │
│   │   ├── reviews/
│   │   ├── saved-shops/
│   │   ├── search/                   # POST /search (record + run), GET /search/popular, GET /search/demand-gaps
│   │   ├── locations/
│   │   ├── demand-requests/
│   │   ├── notifications/
│   │   ├── uploads/
│   │   │   ├── uploads.routes.js     # POST /uploads/presign
│   │   │   ├── uploads.controller.js
│   │   │   └── uploads.service.js    # talks to S3-compatible SDK, returns presigned PUT URL + public GET URL
│   │   ├── subscriptions/
│   │   ├── payments/
│   │   ├── creators/
│   │   ├── campaigns/
│   │   └── admin/                    # phase 3 — dashboard KPIs, audit logs, moderation actions
│   │
│   ├── middleware/
│   │   ├── authenticate.js           # verifies JWT from Authorization header, attaches req.auth = { type, id }
│   │   ├── authorize.js              # requireRole('merchant') / requireRole('customer') / requireRole('admin')
│   │   ├── ownership.js              # helpers: assertOwnsShop(req), assertOwnsOrder(req) — used inside controllers
│   │   ├── validate.js               # wraps a zod schema into an Express middleware, 400s on failure
│   │   ├── errorHandler.js           # last-mile Express error handler, maps AppError subtypes → HTTP status + JSON
│   │   └── rateLimiter.js            # express-rate-limit configs for /auth/* routes
│   │
│   ├── realtime/
│   │   ├── socket.js                 # creates the Socket.IO server, JWT-auth handshake, room-join handlers
│   │   ├── rooms.js                  # room name helpers: shopRoom(shopId), customerRoom(customerId), conversationRoom(id)
│   │   └── events.js                 # event name constants: PRODUCT_CREATED, PRODUCT_UPDATED, ORDER_CREATED, ORDER_STATUS_CHANGED, MESSAGE_CREATED, ...
│   │
│   ├── jobs/
│   │   ├── scheduler.js              # node-cron wiring
│   │   ├── expireStaleEnquiries.js   # marks enquiries/offers 'expired' past expires_at
│   │   └── expireDemandRequests.js
│   │
│   ├── errors/
│   │   └── AppError.js               # NotFoundError, ValidationError, ForbiddenError, ConflictError — all extend AppError
│   │
│   └── utils/
│       ├── logger.js                 # pino or console-based structured logger
│       ├── asyncHandler.js           # wraps async route handlers so rejects reach errorHandler
│       ├── password.js               # bcrypt hash/compare wrappers
│       ├── jwt.js                    # sign/verify access + refresh tokens
│       ├── pagination.js             # shared limit/offset/cursor parsing
│       └── orderCode.js              # human-friendly code generator (GL-ORD-xxxxx)
│
└── tests/
    ├── modules/orders.test.js
    ├── modules/products.test.js
    └── ...
```

### 4.1 Why this layering (for the implementing agent)

Every module follows the same four-file shape. Keep new modules the same shape — don't collapse layers even when a module feels "too small for four files":

- **`*.routes.js`** — only `router.get/post/patch/delete(path, [middleware...], controllerFn)`. No logic.
- **`*.controller.js`** — pulls data off `req` (params/body/query/`req.auth`), calls exactly one service method, sends the HTTP response. No SQL, no business rules.
- **`*.service.js`** — business logic: validation beyond shape (e.g. "stock must be ≥ quantity"), orchestration across repositories, socket emission, calling other services. This is where the fix for the reported bug lives (§7.5).
- **`*.repository.js`** — the only place SQL text exists for that domain. Every function takes plain values, returns plain rows. No `req`/`res` ever appears here.

This is "the DB layer" you asked for explicitly: `db/pool.js` + every `*.repository.js` file. If another agent needs to change how a query is written, that's the only place to look.

---

## 5. Auth strategy

- **Password hashing:** bcrypt, cost factor 12, via `utils/password.js`. Applies to `customers.password_hash`, `merchants.password_hash`, `admins.password_hash`.
- **Tokens:** short-lived JWT access token (15 min, `Authorization: Bearer <token>`), long-lived refresh token (30 days, httpOnly + `Secure` + `SameSite=None` cookie since customer-web/merchant-web/api are on different subdomains). Refresh tokens are rotated on every use and their hash stored in `refresh_tokens` so a stolen refresh token can be revoked.
- **JWT payload:** `{ sub: <id>, type: 'customer' | 'merchant' | 'admin', iat, exp }`. `middleware/authenticate.js` verifies signature+expiry and sets `req.auth = { type, id }`. Every subsequent authorization check is `req.auth.type === 'merchant'` plus an ownership check (e.g. `shop.merchant_id === req.auth.id`), done in `middleware/ownership.js` helpers called from controllers.
- **No shared login endpoint.** `/api/auth/customer/signup`, `/api/auth/customer/login`, `/api/auth/merchant/signup`, `/api/auth/merchant/login` are separate routes hitting separate tables. This is what makes "no merchant code in the customer bundle" actually true at the auth layer too — `apps/customer-web` never imports anything that knows about merchant login.
- **Admins are never self-registered.** `admins` rows are created by `db/seeds/003_admin.js` from an env var (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, hashed at seed time) or manually via `psql`. This removes the currently-hardcoded `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` constants sitting in `src/services/authService.js` today — that is a real, shippable-today security fix independent of the rest of this migration if you want to do it first.

---

## 6. API contract

Base URL per environment, e.g. `https://api.growlocal.in/api`. All bodies are JSON. All list endpoints support `?limit=&offset=`.

### 6.1 Auth (`/api/auth/*`)

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/customer/signup` | none | `{ fullName, email, password, phone? }` | creates `customers` row, returns access token + sets refresh cookie |
| POST | `/auth/customer/login` | none | `{ email, password }` | |
| POST | `/auth/merchant/signup` | none | `{ ownerName, businessName, email, password, phone }` | creates `merchants` row, `verification_status='pending'` |
| POST | `/auth/merchant/login` | none | `{ email, password }` | |
| POST | `/auth/admin/login` | none | `{ email, password }` | only matches seeded `admins` rows |
| POST | `/auth/refresh` | refresh cookie | — | rotates refresh token, returns new access token |
| POST | `/auth/logout` | any | — | revokes current refresh token |
| GET | `/auth/me` | any | — | returns the caller's own row (customer/merchant/admin, discriminated by `req.auth.type`) |

### 6.2 Customers (`/api/customers/*`) — customer-web only

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/customers/me` | customer | profile |
| PATCH | `/customers/me` | customer | update name/phone/avatar/location |

### 6.3 Merchants & Shops (`/api/merchants/*`, `/api/shops/*`) — merchant-web writes, customer-web reads

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/merchants/me` | merchant | own business profile |
| PATCH | `/merchants/me` | merchant | |
| GET | `/merchants/me/shop` | merchant | convenience: their shop, if any |
| GET | `/shops` | none | public catalog list — filters: `category`, `city`, `q`, `lat`, `lng`, `radiusKm` |
| GET | `/shops/:id` | none | public shop detail incl. hours/photos |
| POST | `/shops` | merchant | createShop — `{ name, description, categoryId, address, city, phone, logoUrl?, coverImageUrl? }` |
| PATCH | `/shops/:id` | merchant (owner) | |
| DELETE | `/shops/:id` | admin | |

### 6.4 Products (`/api/products/*`) — the module directly implicated in the reported bug

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/products` | none | public — filters: `shopId`, `categoryId`, `q`, `minPrice`, `maxPrice`; only returns `approval_status='approved'` for non-owner callers |
| GET | `/products/:id` | none | |
| POST | `/products` | merchant (owns `shopId` in body) | createProduct — on success, `products.service.js` **must** emit `PRODUCT_CREATED` on the `catalog` room and the owning `shop:{shopId}` room in the same request (§7.5) |
| PATCH | `/products/:id` | merchant (owner) | emits `PRODUCT_UPDATED` |
| DELETE | `/products/:id` | merchant (owner) | emits `PRODUCT_DELETED` |
| PATCH | `/products/:id/stock` | merchant (owner) | `{ stockQuantity, availabilityStatus }` |

### 6.5 Orders (`/api/orders/*`) — the "createOrder" API you asked for by name

| Method | Path | Auth | Body | Notes |
|---|---|---|---|
| POST | `/orders` | customer | `{ productId, productVariantId?, quantity, fulfillmentType, deliveryAddress?, offerId? }` | `orders.service.js`: validates stock, computes `unitPrice`/`totalAmount` server-side (never trust client price), decrements `product`/`product_variants` stock in the same DB transaction, inserts the `orders` row, emits `ORDER_CREATED` to `shop:{shopId}` room and `customer:{customerId}` room |
| GET | `/orders/mine` | customer | — | customer's own orders, newest first |
| GET | `/orders/shop` | merchant | — | orders for the merchant's shop(s) |
| GET | `/orders/:id` | customer (owner) or merchant (owner) | — | |
| PATCH | `/orders/:id/status` | merchant (owner) | `{ status }` | enforces the state machine in §3.2's `orders.status` CHECK; emits `ORDER_STATUS_CHANGED` to `customer:{customerId}` room |
| PATCH | `/orders/:id/cancel` | customer (owner) | — | only while `status='pending_confirmation'` |

### 6.6 Enquiries & Offers (`/api/enquiries/*`, `/api/offers/*`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/enquiries` | customer | start a negotiation thread on a product |
| GET | `/enquiries/mine` | customer | |
| GET | `/enquiries/shop` | merchant | |
| POST | `/offers` | merchant | responds to an enquiry with a price |
| POST | `/offers/:id/accept` | customer (owner of the parent enquiry) | **creates an `orders` row** with `origin='offer_accepted'`, `offer_id` set — reuses `orders.service.js` create logic |
| POST | `/offers/:id/reject` | customer | |

### 6.7 Conversations & messages (`/api/conversations/*`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/conversations` | customer or merchant | list threads for the caller |
| GET | `/conversations/:id/messages` | participant | paginated |
| POST | `/conversations/:id/messages` | participant | persists + emits `MESSAGE_CREATED` to `conversation:{id}` room |

### 6.8 Everything else

Follow the same pattern for `categories`, `locations`, `reviews`, `saved-shops`, `search`, `demand-requests`, `notifications`, `subscriptions`, `payments`, `creators`, `campaigns` — one public read path, one authenticated write path scoped to the owning `customer_id`/`merchant_id`, mirroring the function list already present in `src/services/*.js` (that file-by-file inventory is your reference for "what fields/behavior existed before"; do not re-derive it from the UI). `uploads` is documented separately in §7.4.

---

## 7. Backend implementation notes

### 7.1 Request lifecycle

`routes` → `authenticate` (if not public) → `authorize`/ownership check → `validate` (zod) → `controller` → `service` → `repository` → Postgres. Errors thrown anywhere flow to `errorHandler.js` via `asyncHandler.js`; nothing catches-and-swallows (`catch (e) {}`) the way the current frontend code frequently does — that pattern is explicitly what let the reported bug go unnoticed.

### 7.2 Transactions

Any write that touches more than one table (`createOrder` writing `orders` + decrementing `products.stock_quantity`; `signup` writing `merchants` + nothing else is fine as one statement) must run inside a single `pg` client transaction (`BEGIN`/`COMMIT`/`ROLLBACK`), acquired once per repository call via `db/pool.js`'s `withTransaction(fn)` helper. Never issue the two statements as separate pool queries — that reintroduces the "half-written state" class of bug.

### 7.3 Authorization pattern

Two checks, always both present on any non-public write route:
1. **Role check** (`middleware/authorize.js`): is the caller a merchant at all?
2. **Ownership check** (`middleware/ownership.js`, called inside the controller once the target row is loaded): does `shop.merchant_id === req.auth.id`? Does `order.customer_id === req.auth.id`?

Never rely on the client to send a trustworthy `merchantId`/`customerId` in the body — always derive "whose data is this" from `req.auth.id` set by the verified JWT, exactly like `createProduct` today incorrectly lets `prodWithOwnership.merchantId` come from client state (`src/App.jsx` `handleAddProduct`). That's a spoofable field in the current app; it must not be in the new one.

### 7.4 File uploads

Drop Supabase Storage. Use an S3-compatible bucket (Cloudflare R2, AWS S3, or self-hosted MinIO — pick one, the interface is identical). Keep the same logical bucket separation the current app already has in `src/services/storageService.js` (`BUCKETS` constant): `avatars`, `shop-images`, `product-images`, `creator-images`, `homepage-assets` (all public-read), `chat-attachments`, `verification-documents` (both private).

Flow: `apps/*-web` calls `POST /api/uploads/presign` with `{ bucket, contentType }` → API validates the caller is allowed to write to that bucket (e.g. only merchants can presign `product-images`) → returns a short-lived presigned `PUT` URL → the browser uploads the file directly to object storage, never through the API process → the browser then sends the resulting public URL as a normal field (`logoUrl`, `imageUrl`, ...) on the next API call. For the two private buckets, don't return a public URL — store the object key and serve it through an authenticated `GET /api/uploads/:bucket/:key` proxy route that checks ownership before redirecting to a short-lived signed `GET` URL.

### 7.5 Realtime — this is the actual fix for the reported bug

`services/api` runs one Socket.IO server attached to the same HTTP server as Express (`src/index.js`). Socket handshake carries the same JWT used for REST calls; `realtime/socket.js` verifies it and joins the connection to rooms based on `req.auth`:

- Every connection joins `catalog` (public — anyone can see new products/shops appear).
- A merchant connection additionally joins `shop:{shopId}` for each shop they own.
- A customer connection additionally joins `customer:{customerId}`.
- A participant in a conversation joins `conversation:{conversationId}` when they open that thread.

The rule that fixes the bug: **every service function that writes to `products`, `shops`, or `orders` emits its event to the relevant room(s) inside the same function, right after the transaction commits — not from a separate polling job, not from a debounced batch.** Example shape for `products.service.js`:

```js
async function createProduct(merchantId, input) {
  const shop = await shopsRepository.findOwnedByMerchant(input.shopId, merchantId);
  if (!shop) throw new ForbiddenError('You do not own this shop');

  const product = await productsRepository.create(input); // single INSERT, returns row

  io.to('catalog').to(rooms.shopRoom(shop.id)).emit(events.PRODUCT_CREATED, product);
  return product;
}
```

`apps/customer-web`'s `hooks/useLiveCatalog.js` listens for `PRODUCT_CREATED`/`PRODUCT_UPDATED`/`PRODUCT_DELETED` on the `catalog` room and merges the change into whatever list is currently rendered — no polling, no TTL cache, no localStorage mirror. On initial page load it does one plain `GET /api/products`; after that, the socket is the only update path until the next full page load. This removes every one of the three root causes named in §0: there is exactly one cache (React state for the current session), it is invalidated by an event fired from the same write that caused it to go stale, and a disconnected/misconfigured socket is a visible connection-status indicator in the UI rather than a silent no-op.

### 7.6 Background jobs

`node-cron` inside the API process (fine at this scale; move to a separate worker process only if the API process becomes I/O-bound):
- Expire `enquiries`/`offers` past `expires_at` → status `expired`.
- Expire `demand_requests` past a TTL.
- Optionally: nightly `analytics_events` rollups for the admin dashboard (phase 3).

---

## 8. Frontend split plan

### 8.1 What moves where, from the current `src/`

| Current file/dir | Destination |
|---|---|
| `src/views/Customer*.jsx` | `apps/customer-web/src/pages/*.jsx` |
| `src/views/Merchant*.jsx` | `apps/merchant-web/src/pages/*.jsx` |
| `src/views/admin/*.jsx` | `apps/admin-web/src/pages/*.jsx` (phase 3) |
| `src/components/Toast.jsx`, `Rating.jsx`, `VerifiedBadge.jsx` | `packages/ui/src/*.jsx` (no data fetching in these — verify before moving) |
| `src/components/AuthModal.jsx`, `BuyNowModal.jsx`, `DemandRequestModal.jsx`, `AdvanceSearchBar.jsx`, `LocationSelector.jsx`, `PhotoSearchModal.jsx` | `apps/customer-web/src/components/` |
| `src/components/MerchantAuthPage.jsx`, `MerchantOnboardingWizard.jsx`, `MerchantShopSetupModal.jsx`, `IncomingOrderAlertModal.jsx` | `apps/merchant-web/src/components/` |
| `src/components/AdminAuthPage.jsx` | `apps/admin-web/src/components/` (phase 3) |
| `src/services/*.js` | **deleted**, replaced by `packages/api-client` (thin fetch/socket wrapper) called from each app's `lib/apiClient.js`; the *business logic* inside these files (e.g. the enquiry/reservation status transitions) moves into `services/api/src/modules/*/*.service.js` instead |
| `src/data/mockData.js`, `adminMockData.js` | delete once real API data is wired up everywhere; keep only as seed data inspiration for `db/seeds/` |
| `src/hooks/useRealtimeMessages.js`, `useRealtimeNotifications.js` | rewritten against `packages/api-client/src/sockets.js` instead of `supabase.channel(...)`, one copy per app that needs it |
| `src/App.jsx` role-guard logic (`activePlatform`, `navigateToPath` cross-role checks) | **deleted entirely.** There is no cross-role logic to guard once customer-web physically cannot render a merchant route — it doesn't have the code. |

### 8.2 Per-app auth

Each app keeps its own `AuthContext` talking only to its own audience's endpoints (`/auth/customer/*` for customer-web, `/auth/merchant/*` for merchant-web). Access token in memory (React state/context), refresh token in an httpOnly cookie scoped to `api.growlocal.in` with `SameSite=None; Secure` so it's sent cross-subdomain on `fetch(..., { credentials: 'include' })`.

### 8.3 No shared "current user" concept

Do not build a shared `packages/auth` that knows about all three roles — that recreates the current `profiles.role` coupling this migration removes. `packages/api-client` may export three separate typed clients (`customerAuthClient`, `merchantAuthClient`) but never a role-branching one.

---

## 9. Environment variables

**`services/api/.env`**
```
PORT=4000
DATABASE_URL=postgres://user:pass@host:5432/growlocal
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
CUSTOMER_WEB_URL=https://app.growlocal.in
MERCHANT_WEB_URL=https://merchant.growlocal.in
ADMIN_WEB_URL=https://admin.growlocal.in
S3_ENDPOINT=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_PREFIX=growlocal-
SEED_ADMIN_EMAIL=...
SEED_ADMIN_PASSWORD=...
```

**`apps/customer-web/.env`** / **`apps/merchant-web/.env`**
```
VITE_API_BASE_URL=https://api.growlocal.in/api
VITE_WS_URL=https://api.growlocal.in
```

---

## 10. Deployment topology

Matches the whiteboard's "deployed somewhere else" boxes, made concrete:

| Deployable | Where | Build |
|---|---|---|
| `apps/customer-web` | Netlify/Vercel site #1 | base dir `apps/customer-web`, build `npm run build --workspace=apps/customer-web`, publish `apps/customer-web/dist` |
| `apps/merchant-web` | Netlify/Vercel site #2 (separate site, separate domain) | same pattern, `apps/merchant-web` |
| `services/api` | Render/Railway/Fly.io (long-running Node process, needed for Socket.IO — do not deploy the API as Netlify serverless functions, they can't hold WebSocket connections) | root dir `services/api`, `npm start` |
| PostgreSQL | Neon/Railway/RDS, or keep the existing Supabase Postgres instance and just stop using its Auth/Storage/PostgREST/RLS features | connection string → `DATABASE_URL` |
| Object storage | Cloudflare R2 or AWS S3 | |

CORS on `services/api` allow-lists exactly `CUSTOMER_WEB_URL` and `MERCHANT_WEB_URL` (and `ADMIN_WEB_URL` once it exists) — nothing else, so a copied/leaked API base URL can't be hit from an arbitrary origin.

---

## 11. Phased implementation roadmap

Build in this order; each phase should be independently mergeable and testable.

**Phase 0 — skeleton.** `services/api` boots, connects to Postgres, migration `001_init.sql` applied, `auth` module fully working end-to-end (signup/login/refresh/logout/me for customer + merchant), `packages/api-client` scaffolded, both `apps/customer-web` and `apps/merchant-web` can sign up/log in against it. No catalog yet.

**Phase 1 — the core loop that fixes the reported bug.** `shops`, `products`, `orders` modules, Socket.IO wired per §7.5, `apps/customer-web` catalog pages and `apps/merchant-web` product management pages both hitting the real API with no client cache. **Explicitly verify the fix**: open customer-web and merchant-web in two browsers, add a product as a merchant, confirm it appears on customer-web without a refresh, within roughly one round-trip of the socket event.

**Phase 2 — negotiation & chat.** `enquiries`, `offers`, `conversations`/`messages` modules; offer-accept → order creation path.

**Phase 3 — everything else.** `reviews`, `saved-shops`, `search`, `demand-requests`, `notifications`, `subscriptions`, `payments`, `creators`, `campaigns`, then `apps/admin-web` as a fourth app following the identical pattern, and the `admin` module in the API.

**Phase 4 — cutover.** Point DNS at the new apps, migrate/export existing Supabase data (write a one-off script under `services/api/scripts/migrate-from-supabase.js` that reads via `@supabase/supabase-js` service-role key and writes via the new repositories — do this last, once the new schema is proven, not before), decommission the Supabase project, delete the legacy `src/` monolith and `supabase/` directory from this repo.

---

## 12. Summary of intentional deviations from the rough whiteboard sketch

1. **Merchant frontend never reads the DB directly.** Replaced with REST + Socket.IO through `services/api` (§1, §7.5). A browser must never hold DB credentials.
2. **Two frontends, not one with route guards.** `apps/customer-web` and `apps/merchant-web` are separate npm workspaces with no shared route tree — "we should not have merchant related things in customer facing website" is enforced by the code simply not existing in that bundle, not by a runtime `if`.
3. **`Customers` and `Orders` tables exist exactly as asked**, plus `Merchants`/`Admins` as their own tables rather than one polymorphic `profiles` table, because the two frontends should never need to know about each other's user shape.
4. **Enquiries/Offers kept, `Reservations` retired into `Orders`.** The old app had `reservations` *and* ad-hoc `localStorage`-only "Buy Now"/"reserve" objects representing the same real-world thing three different ways. One `orders` table now, with an explicit state machine.
