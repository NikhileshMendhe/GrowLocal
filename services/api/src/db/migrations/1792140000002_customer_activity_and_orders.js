/**
 * 002_customer_activity_and_orders — Phase 2 database schema improvements.
 *
 * Adds:
 * 1. customer_activities — tracks business events (views, cart adds, quantity changes,
 *    WhatsApp inquiry clicks, order placements) for real-time admin monitoring.
 * 2. order_items — enables multi-product cart orders.
 * 3. order_status_history — audit trail of order and delivery status transitions.
 * 4. deliveries — dedicated order delivery and dispatch management.
 * 5. Expands orders.status CHECK constraint to include modern marketplace statuses:
 *    pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled.
 * 6. Adds newly created tables to supabase_realtime publication.
 */
export const up = (pgm) => {
  pgm.sql(`
-- ============================================================================
-- 1. CUSTOMER ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  activity_type VARCHAR(100) NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255),
  product_price NUMERIC(10, 2),
  quantity INT DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_activities_customer_id ON customer_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_activities_product_id ON customer_activities(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_activities_activity_type ON customer_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_customer_activities_created_at ON customer_activities(created_at DESC);

-- ============================================================================
-- 2. ORDER ITEMS TABLE (for multi-product cart checkouts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- 3. ORDER STATUS HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_type VARCHAR(20) NOT NULL DEFAULT 'system',
  changed_by_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- ============================================================================
-- 4. DELIVERIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  delivery_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  delivery_pincode VARCHAR(20),
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(50),
  delivery_notes TEXT,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(delivery_status);

-- ============================================================================
-- 5. ORDERS TABLE CONSTRAINTS UPDATE
-- ============================================================================
-- Relax product_id and shop_id NOT NULL constraints to support multi-item cart orders
ALTER TABLE orders ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN shop_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN merchant_id DROP NOT NULL;

-- Drop previous status check constraint and update to include modern marketplace statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending', 'pending_confirmation', 'confirmed', 'processing', 'ready',
  'ready_for_pickup', 'shipped', 'out_for_delivery', 'delivered', 'completed',
  'cancelled', 'rejected_by_merchant', 'cancelled_by_customer', 'expired'
));

-- ============================================================================
-- 6. REALTIME PUBLICATION REGISTRATION
-- ============================================================================
DO $$
BEGIN
  -- Add tables to supabase_realtime publication if not already present
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE customer_activities;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS customer_activities CASCADE;
  `);
};
