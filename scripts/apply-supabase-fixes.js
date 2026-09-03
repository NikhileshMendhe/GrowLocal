import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Nikhilesh%4007@db.nydusjwdmmqtapfjhrpl.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase Postgres!');

  const sql = `
    -- 1. MERCHANTS POLICIES
    ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public merchants read access" ON public.merchants;
    CREATE POLICY "Public merchants read access" ON public.merchants FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow merchant insert" ON public.merchants;
    CREATE POLICY "Allow merchant insert" ON public.merchants FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow merchant update" ON public.merchants;
    CREATE POLICY "Allow merchant update" ON public.merchants FOR UPDATE USING (true) WITH CHECK (true);

    -- 2. SHOPS POLICIES
    ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public shops read access" ON public.shops;
    CREATE POLICY "Public shops read access" ON public.shops FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow shop insert" ON public.shops;
    CREATE POLICY "Allow shop insert" ON public.shops FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow shop update" ON public.shops;
    CREATE POLICY "Allow shop update" ON public.shops FOR UPDATE USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow shop delete" ON public.shops;
    CREATE POLICY "Allow shop delete" ON public.shops FOR DELETE USING (true);

    -- 3. PRODUCTS POLICIES
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public products read access" ON public.products;
    CREATE POLICY "Public products read access" ON public.products FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow product insert" ON public.products;
    CREATE POLICY "Allow product insert" ON public.products FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow product update" ON public.products;
    CREATE POLICY "Allow product update" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow product delete" ON public.products;
    CREATE POLICY "Allow product delete" ON public.products FOR DELETE USING (true);

    -- 4. ENQUIRIES, OFFERS, RESERVATIONS, MESSAGES POLICIES
    DROP POLICY IF EXISTS "Public enquiries access" ON public.enquiries;
    CREATE POLICY "Public enquiries access" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Public offers access" ON public.offers;
    CREATE POLICY "Public offers access" ON public.offers FOR ALL USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Public reservations access" ON public.reservations;
    CREATE POLICY "Public reservations access" ON public.reservations FOR ALL USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Public messages access" ON public.messages;
    CREATE POLICY "Public messages access" ON public.messages FOR ALL USING (true) WITH CHECK (true);

    -- 5. REPLICA IDENTITY FOR FULL REALTIME PAYLOADS
    ALTER TABLE public.shops REPLICA IDENTITY FULL;
    ALTER TABLE public.products REPLICA IDENTITY FULL;
    ALTER TABLE public.merchants REPLICA IDENTITY FULL;
    ALTER TABLE public.categories REPLICA IDENTITY FULL;

    -- 6. ADD TO REALTIME PUBLICATION
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
      END IF;
    END $$;

    ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.merchants;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  `;

  await client.query(sql);
  console.log('SUCCESS! RLS policies and Realtime publication configured.');

  const pubCheck = await client.query("SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';");
  console.log('Active Realtime Tables:', pubCheck.rows.map(r => r.tablename));

  await client.end();
}

run().catch(err => {
  console.error('Error executing script:', err);
  process.exit(1);
});
