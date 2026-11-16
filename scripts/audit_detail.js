import { pool } from '../services/api/src/db/pool.js';

async function auditDetail() {
  const piCols = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'product_images' 
    ORDER BY ordinal_position
  `);
  console.log('product_images columns:');
  console.table(piCols.rows);

  const sampleProducts = await pool.query(`
    SELECT p.id, p.name, p.price, p.availability_status, p.stock_quantity, p.is_featured, p.approval_status,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as primary_image
    FROM products p
    LIMIT 5
  `);
  console.log('\nSample products with primary image:');
  console.table(sampleProducts.rows);

  const sampleImages = await pool.query(`SELECT * FROM product_images LIMIT 5`);
  console.log('\nSample product_images rows:');
  console.table(sampleImages.rows);

  const categories = await pool.query(`SELECT id, name, slug, icon_url FROM categories ORDER BY display_order NULLS LAST`);
  console.log('\nCategories:');
  console.table(categories.rows);

  const storagePolicies = await pool.query(`
    SELECT polname, polcmd, polroles::regrole[] as roles
    FROM pg_policy 
    WHERE polrelid = 'storage.objects'::regclass
  `);
  console.log('\nstorage.objects policies:');
  console.table(storagePolicies.rows);

  const productPolicies = await pool.query(`
    SELECT polname, polcmd, polroles::regrole[] as roles
    FROM pg_policy 
    WHERE polrelid = 'products'::regclass
  `);
  console.log('\nproducts policies:');
  console.table(productPolicies.rows);

  await pool.end();
}

auditDetail().catch(console.error);
