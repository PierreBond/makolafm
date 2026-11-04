// Bulk-seeds gems straight into the D1 database as APPROVED.
// 1. Put real spots in data/seed-gems.json (name, lat/lng within MAKOLA_BOUNDS)
// 2. Put your admin key in ADMIN_KEY env var or edit below
// 3. Run: npm run seed
const fs = require('fs');
const path = require('path');

const BASE = process.env.SEED_BASE_URL || 'https://makolafm.pierrebond.workers.dev';
const ADMIN_KEY = process.env.ADMIN_KEY || 'makola-admin-2026';

async function main() {
  const gems = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/seed-gems.json'), 'utf8'));
  const valid = gems.filter((g) => g.id && g.label && g.latitude && g.longitude && !g.label.includes('PLACEHOLDER'));
  if (valid.length === 0) {
    console.log('No valid gems found. Fill data/seed-gems.json first (remove PLACEHOLDER entries).');
    return;
  }

  // 1. Insert as pending
  const upserts = valid.map((g) => ({
    id: g.id,
    label: g.label,
    category: g.category || 'custom',
    description: g.description || undefined,
    latitude: g.latitude,
    longitude: g.longitude,
    created_at: new Date().toISOString(),
    deviceId: 'seed-import',
  }));
  const post = await fetch(`${BASE}/api/gems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upserts }),
  });
  if (!post.ok) {
    console.error('Upsert failed:', post.status, await post.text());
    return;
  }

  // 2. Approve each one
  for (const g of valid) {
    const res = await fetch(`${BASE}/api/admin/gems/${encodeURIComponent(g.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
      body: JSON.stringify({ action: 'approve' }),
    });
    console.log(`${res.ok ? '✓' : '✕'} ${g.id} -> ${res.ok ? 'approved' : res.status}`);
  }
  console.log(`Done: ${valid.length} gems seeded.`);
}

main();
