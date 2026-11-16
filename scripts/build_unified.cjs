const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const adminDistDir = path.join(distDir, 'admin');

console.log('=== Building Unified Distribution for Netlify ===');

try {
  // 1. Build customer-web
  console.log('\n[1/3] Building Customer Storefront (apps/customer-web)...');
  execSync('npm run build --workspace=apps/customer-web', { cwd: rootDir, stdio: 'inherit' });

  // 2. Build admin-web with base = /admin/
  console.log('\n[2/3] Building Admin Console with base /admin/ (apps/admin-web)...');
  execSync('npm run build --workspace=apps/admin-web', {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, VITE_BASE_PATH: '/admin/' },
  });

  // 3. Assemble unified dist folder
  console.log('\n[3/3] Assembling unified dist folder...');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Copy customer-web build to root of dist/
  const customerBuildDir = path.join(rootDir, 'apps', 'customer-web', 'dist');
  fs.cpSync(customerBuildDir, distDir, { recursive: true });

  // Copy admin-web build to dist/admin/
  fs.mkdirSync(adminDistDir, { recursive: true });
  const adminBuildDir = path.join(rootDir, 'apps', 'admin-web', 'dist');
  fs.cpSync(adminBuildDir, adminDistDir, { recursive: true });

  console.log('\n✓ Unified distribution assembled successfully in dist/:');
  console.log('  - /         -> Customer Storefront');
  console.log('  - /admin    -> Admin Console\n');
} catch (err) {
  console.error('\n❌ Unified build failed:', err.message);
  process.exit(1);
}
