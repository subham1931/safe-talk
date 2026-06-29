#!/usr/bin/env node
/**
 * Apply debit_wallet migration when SUPABASE_DB_URL or --db-password is set.
 * Usage: node scripts/apply-debit-migration.mjs [--db-password YOUR_DB_PASSWORD]
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const PROJECT_REF = 'nfamoqameetdwpwncqxi';

function loadEnv() {
  const envPath = resolve(root, '.env');
  const raw = readFileSync(envPath, 'utf8');
  const vars = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim();
  }
  return vars;
}

const env = loadEnv();
const accessToken = env.SUPABASE_ACCESS_TOKEN;
const sql = readFileSync(
  resolve(root, 'supabase/migrations/20260629130000_wallet_debit_rpc.sql'),
  'utf8'
);

const passwordArg = process.argv.find((a) => a.startsWith('--db-password='));
const dbPassword = passwordArg?.split('=')[1] || env.SUPABASE_DB_PASSWORD;
const dbUrl =
  env.SUPABASE_DB_URL ||
  env.DATABASE_URL ||
  (dbPassword
    ? `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
    : null);

async function applyViaManagementApi() {
  if (!accessToken) return false;
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    console.error('Management API failed:', res.status, await res.text());
    return false;
  }
  console.log('Applied debit_wallet migration via Management API.');
  return true;
}

async function applyViaPg() {
  if (!dbUrl) return false;
  try {
    const pg = await import('pg');
    const client = new pg.default.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log('Applied debit_wallet migration via Postgres.');
    return true;
  } catch (err) {
    console.warn('Postgres apply failed:', err.message);
    return false;
  }
}

async function main() {
  if (await applyViaManagementApi()) return;
  if (await applyViaPg()) return;

  console.log('Could not apply automatically. Run in Supabase Dashboard → SQL Editor:\n');
  console.log(sql);
}

main().catch((err) => {
  console.error(err.message);
  console.log('\nRun the SQL above in Supabase Dashboard → SQL Editor.');
  process.exit(1);
});
