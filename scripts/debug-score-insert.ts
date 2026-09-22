import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length > 0) envVars[k.trim()] = v.join('=').trim();
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || '';
const anonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';
const serviceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || '';

const anonClient = createClient(supabaseUrl, anonKey);
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  const login = await anonClient.auth.signInWithPassword({
    email: 'subscriber@fairwaykind.com',
    password: 'Password123!'
  });
  console.log('Login error:', login.error?.message);
  console.log('User ID:', login.data.user?.id);

  // Check scores table directly with admin client
  const { data: adminScores, error: adminScoresErr } = await adminClient
    .from('scores')
    .select('*')
    .eq('user_id', login.data.user?.id || '');
  console.log('Admin scores fetch:', adminScores?.length, 'error:', adminScoresErr?.message);

  // Check scores table with anonClient
  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${login.data.session?.access_token}` } }
  });

  const { data: userScores, error: userScoresErr } = await userClient
    .from('scores')
    .select('*');
  console.log('User scores fetch:', userScores?.length, 'error:', userScoresErr?.message);

  // Try inserting score as user
  const { data: insertRes, error: insertErr } = await userClient
    .from('scores')
    .insert({
      user_id: login.data.user?.id,
      score: 38,
      played_on: '2026-09-18',
      is_active: true
    })
    .select();
  console.log('User score insert:', insertRes, 'error:', insertErr?.message);
}

test().catch(console.error);
