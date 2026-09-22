import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length > 0) envVars[k.trim()] = v.join('=').trim();
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || 'https://rjqqgxczyxrnkvjvlnnr.supabase.co';
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('Checking existing users in Supabase...');
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  
  if (usersErr) {
    console.error('Error listing users:', usersErr);
    return;
  }

  console.log(`Found ${usersData.users.length} users in auth:`);
  for (const u of usersData.users) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single();
    console.log(`- Email: ${u.email} | ID: ${u.id} | Role in profile: ${prof?.role || 'none'}`);
  }

  // Desired accounts
  const testAccounts = [
    {
      email: 'admin@fairwaykind.com',
      password: 'Password123!',
      fullName: 'Fairway Administrator',
      role: 'admin'
    },
    {
      email: 'subscriber@fairwaykind.com',
      password: 'Password123!',
      fullName: 'Fairway Golfer',
      role: 'user'
    }
  ];

  for (const acc of testAccounts) {
    const existing = usersData.users.find(u => u.email === acc.email);
    if (!existing) {
      console.log(`Creating test account: ${acc.email} (${acc.role})...`);
      const { data: createdUser, error: createErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.fullName,
          role: acc.role
        }
      });
      if (createErr) {
        console.error(`Failed to create ${acc.email}:`, createErr.message);
      } else if (createdUser.user) {
        console.log(`✓ Created user ${acc.email} (${createdUser.user.id})`);
        // Upsert profile
        await supabase.from('profiles').upsert({
          id: createdUser.user.id,
          email: acc.email,
          full_name: acc.fullName,
          role: acc.role,
          updated_at: new Date().toISOString()
        });

        // If subscriber, also ensure an active subscription and scores exist for immediate testing!
        if (acc.role === 'user') {
          console.log(`Creating sample active subscription and scores for ${acc.email}...`);
          await supabase.from('subscriptions').upsert({
            user_id: createdUser.user.id,
            stripe_customer_id: 'cus_test_' + createdUser.user.id.slice(0, 8),
            stripe_subscription_id: 'sub_test_' + createdUser.user.id.slice(0, 8),
            plan_type: 'monthly',
            status: 'active',
            charity_id: 'c1000000-0000-0000-0000-000000000001',
            voluntary_charity_percent: 15,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
            cancel_at_period_end: false
          });

          // Insert 5 scores
          const scores = [
            { score: 38, played_on: '2026-09-18' },
            { score: 41, played_on: '2026-09-15' },
            { score: 36, played_on: '2026-09-11' },
            { score: 39, played_on: '2026-09-08' },
            { score: 35, played_on: '2026-09-03' },
          ];
          for (const s of scores) {
            await supabase.from('scores').upsert({
              user_id: createdUser.user.id,
              score: s.score,
              played_on: s.played_on
            });
          }
          console.log(`✓ Seeded subscription and 5 scores for ${acc.email}`);
        }
      }
    } else {
      console.log(`Updating ${acc.email} profile role to: ${acc.role}...`);
      await supabase.auth.admin.updateUserById(existing.id, {
        password: acc.password,
        user_metadata: { full_name: acc.fullName, role: acc.role }
      });
      await supabase.from('profiles').upsert({
        id: existing.id,
        email: acc.email,
        full_name: acc.fullName,
        role: acc.role,
        updated_at: new Date().toISOString()
      });
      console.log(`✓ Updated ${acc.email} with password and role: ${acc.role}`);

      if (acc.role === 'user') {
        console.log(`Ensuring active subscription and scores exist for ${acc.email}...`);
        await supabase.from('subscriptions').upsert({
          user_id: existing.id,
          stripe_customer_id: 'cus_test_' + existing.id.slice(0, 8),
          stripe_subscription_id: 'sub_test_' + existing.id.slice(0, 8),
          plan_type: 'monthly',
          status: 'active',
          charity_id: 'c1000000-0000-0000-0000-000000000001',
          voluntary_charity_percent: 15,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
          cancel_at_period_end: false
        }, { onConflict: 'user_id' });

        // Insert 5 scores
        const scores = [
          { score: 38, played_on: '2026-09-18' },
          { score: 41, played_on: '2026-09-15' },
          { score: 36, played_on: '2026-09-11' },
          { score: 39, played_on: '2026-09-08' },
          { score: 35, played_on: '2026-09-03' },
        ];
        for (const s of scores) {
          await supabase.from('scores').upsert({
            user_id: existing.id,
            score: s.score,
            played_on: s.played_on,
            is_active: true
          }, { onConflict: 'user_id,played_on' });
        }
        console.log(`✓ Seeded subscription and 5 scores for ${acc.email}`);
      }
    }
  }
  console.log('\n--- VERIFYING LOGINS VIA SUPABASE AUTH (ANON CLIENT) ---');
  const anonClient = createClient(supabaseUrl, envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '');

  const adminAuth = await anonClient.auth.signInWithPassword({
    email: 'admin@fairwaykind.com',
    password: 'Password123!'
  });
  console.log('Admin Auth Result:', adminAuth.data.user ? `SUCCESS (User ID: ${adminAuth.data.user.id})` : `FAILED: ${adminAuth.error?.message}`);

  const userAuth = await anonClient.auth.signInWithPassword({
    email: 'subscriber@fairwaykind.com',
    password: 'Password123!'
  });
  console.log('Subscriber Auth Result:', userAuth.data.user ? `SUCCESS (User ID: ${userAuth.data.user.id})` : `FAILED: ${userAuth.error?.message}`);
}

main().catch(console.error);
