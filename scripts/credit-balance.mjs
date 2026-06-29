#!/usr/bin/env node
/**
 * Add wallet balance to a user account.
 *
 * Usage:
 *   node scripts/credit-balance.mjs [email] [password] [amount]
 *   node scripts/credit-balance.mjs --service-role [amount]
 *   node scripts/credit-balance.mjs --access-token [amount]
 *
 * Requires one of:
 *   - SUPABASE_SERVICE_ROLE_KEY in .env (credits most recently updated profile)
 *   - SUPABASE_ACCESS_TOKEN in .env (applies migration + credits via Management API)
 *   - email + password (uses credit_wallet RPC after migration is applied)
 */
import { createClient } from '@supabase/supabase-js';
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
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const accessToken = env.SUPABASE_ACCESS_TOKEN;

const args = process.argv.slice(2);
const useServiceRole = args.includes('--service-role');
const useAccessToken = args.includes('--access-token');
const positional = args.filter((a) => !a.startsWith('--'));

const amount = Number(
  useServiceRole || useAccessToken ? positional[0] || 500 : positional[2] || 500
);
const email = positional[0] || 'test@safetalk.app';
const password = positional[1] || 'password123';

const migrationSql = readFileSync(
  resolve(root, 'supabase/migrations/20260629120000_wallet_credit_rpc.sql'),
  'utf8'
);

const creditSql = `
UPDATE profiles
SET wallet_balance = wallet_balance + ${amount}
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at DESC
  LIMIT 1
);

INSERT INTO transactions (user_id, type, amount, description)
SELECT id, 'recharge', ${amount}, 'Dev credit'
FROM profiles
ORDER BY created_at DESC
LIMIT 1;

SELECT id, anonymous_name, phone, wallet_balance FROM profiles
ORDER BY created_at DESC
LIMIT 1;
`;

async function applyViaManagementApi() {
  if (!accessToken) return false;

  console.log('Applying migration via Supabase Management API...');
  const migrationRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/migrations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'wallet_credit_rpc',
        query: migrationSql,
      }),
    }
  );

  if (!migrationRes.ok) {
    const body = await migrationRes.text();
    console.warn('Migration API:', migrationRes.status, body);
  } else {
    console.log('Migration applied.');
  }

  console.log(`Crediting ₹${amount}...`);
  const creditRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: creditSql }),
    }
  );

  if (!creditRes.ok) {
    console.error('Credit query failed:', creditRes.status, await creditRes.text());
    return false;
  }

  const result = await creditRes.json();
  console.log('Done.', JSON.stringify(result, null, 2));
  return true;
}

async function creditViaServiceRole() {
  if (!serviceKey) return false;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profiles, error: listError } = await admin
    .from('profiles')
    .select('id, anonymous_name, phone, wallet_balance')
    .order('created_at', { ascending: false })
    .limit(1);

  if (listError || !profiles?.length) {
    console.error('Could not list profiles:', listError?.message ?? 'no profiles');
    return false;
  }

  const profile = profiles[0];
  const newBalance = Number(profile.wallet_balance) + amount;

  const { error: updateError } = await admin
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Balance update failed:', updateError.message);
    return false;
  }

  await admin.from('transactions').insert({
    user_id: profile.id,
    type: 'recharge',
    amount,
    description: 'Dev credit',
  });

  console.log(
    `Added ₹${amount} to ${profile.anonymous_name || profile.phone || profile.id}. New balance: ₹${newBalance}`
  );
  return true;
}

async function creditViaRpc() {
  const supabase = createClient(url, anonKey);

  let { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.message === 'Email not confirmed') {
    ({ data, error } = await supabase.auth.signUp({ email, password }));
    if (error && !error.message.includes('already registered')) {
      console.error('Sign-up failed:', error.message);
      return false;
    }
    if (!data.session) {
      ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
    }
  }

  if (error || !data.session) {
    console.error('Sign-in failed:', error?.message ?? 'no session');
    console.error('Usage: node scripts/credit-balance.mjs <email> <password> [amount]');
    return false;
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('credit_wallet', {
    p_amount: amount,
    p_reference: 'Dev credit',
  });

  if (rpcError) {
    console.error('credit_wallet failed:', rpcError.message);
    console.error('\nApply migration first (Supabase Dashboard → SQL Editor):');
    console.log(migrationSql);
    return false;
  }

  console.log(`Added ₹${amount}. New wallet balance: ₹${rpcData.wallet_balance}`);
  return true;
}

async function main() {
  if (!url || !anonKey) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  if (useAccessToken || accessToken) {
    if (await applyViaManagementApi()) return;
  }

  if (useServiceRole || serviceKey) {
    if (await creditViaServiceRole()) return;
  }

  if (!serviceKey && !accessToken) {
    console.log('Tip: add SUPABASE_SERVICE_ROLE_KEY to .env to credit without migration.');
    console.log('Or add SUPABASE_ACCESS_TOKEN from supabase.com/dashboard/account/tokens\n');
  }

  if (!(await creditViaRpc())) {
    process.exit(1);
  }
}

main();
