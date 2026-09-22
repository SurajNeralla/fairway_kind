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
  console.log('--- Setting up exactly 1 admin account and 3 user accounts ---');

  // 1. Target Accounts
  const targetAccounts = [
    {
      email: 'admin@fairwaykind.com',
      password: 'Password123!',
      fullName: 'Suraj Neralla',
      role: 'admin' as const,
    },
    {
      email: 'subscriber@fairwaykind.com',
      password: 'Password123!',
      fullName: 'Hasish Maradana',
      role: 'user' as const,
      scores: [38, 41, 36, 39, 35],
      charityId: 'c1000000-0000-0000-0000-000000000001',
      voluntaryPercent: 15,
    },
    {
      email: 'subscriber2@fairwaykind.com',
      password: 'Password123!',
      fullName: 'Sasidhar Reddy',
      role: 'user' as const,
      scores: [34, 37, 40, 32, 38],
      charityId: 'c2000000-0000-0000-0000-000000000002',
      voluntaryPercent: 10,
    },
    {
      email: 'subscriber3@fairwaykind.com',
      password: 'Password123!',
      fullName: 'Mihir Vijhval',
      role: 'user' as const,
      scores: [42, 39, 44, 36, 41],
      charityId: 'c3000000-0000-0000-0000-000000000003',
      voluntaryPercent: 20,
    },
  ];

  const targetEmails = targetAccounts.map(a => a.email);

  // 2. Fetch existing users
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('Error listing auth users:', listErr);
    return;
  }

  console.log(`Current auth users in system: ${listData.users.length}`);

  // 3. Remove any extra users that do not belong to the target 4
  for (const existingUser of listData.users) {
    if (existingUser.email && !targetEmails.includes(existingUser.email)) {
      console.log(`Deleting extra user: ${existingUser.email} (${existingUser.id})...`);
      // Delete scores, subscriptions, profiles, and auth user
      await supabase.from('scores').delete().eq('user_id', existingUser.id);
      await supabase.from('subscriptions').delete().eq('user_id', existingUser.id);
      await supabase.from('profiles').delete().eq('id', existingUser.id);
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log(`✓ Deleted extra user ${existingUser.email}`);
    }
  }

  // 4. Ensure each target account exists and is configured
  for (const acc of targetAccounts) {
    const existing = listData.users.find(u => u.email === acc.email);
    let userId = existing?.id;

    if (!existing) {
      console.log(`Creating missing account: ${acc.email} (${acc.role})...`);
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.fullName,
          role: acc.role,
        },
      });

      if (createErr) {
        console.error(`Failed to create ${acc.email}:`, createErr.message);
        continue;
      }
      userId = created.user.id;
      console.log(`✓ Created user ${acc.email} (ID: ${userId})`);
    } else {
      console.log(`Updating existing account: ${acc.email}...`);
      await supabase.auth.admin.updateUserById(existing.id, {
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.fullName,
          role: acc.role,
        },
      });
      userId = existing.id;
    }

    if (!userId) continue;

    // 5. Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      email: acc.email,
      full_name: acc.fullName,
      role: acc.role,
      updated_at: new Date().toISOString(),
    });

    // 6. If user account, ensure active subscription and 5 rolling scores
    if (acc.role === 'user') {
      console.log(`Configuring subscription for ${acc.email}...`);
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: `cus_${userId.substring(0, 8)}`,
        stripe_subscription_id: `sub_${userId.substring(0, 8)}`,
        plan_type: 'monthly',
        status: 'active',
        charity_id: acc.charityId,
        voluntary_charity_percent: acc.voluntaryPercent,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      // Clean existing scores and insert 5 clean scores
      await supabase.from('scores').delete().eq('user_id', userId);
      const dates = [
        '2026-09-20',
        '2026-09-17',
        '2026-09-14',
        '2026-09-10',
        '2026-09-05',
      ];

      for (let i = 0; i < (acc.scores || []).length; i++) {
        await supabase.from('scores').insert({
          user_id: userId,
          score: acc.scores[i],
          played_on: dates[i] || '2026-09-01',
          is_active: true,
        });
      }
      console.log(`✓ Seeded active subscription and 5 scores for ${acc.email}`);
    }
  }

  // 7. Verify the final list
  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  const { data: finalProfiles } = await supabase.from('profiles').select('*');
  const { data: finalSubs } = await supabase.from('subscriptions').select('*');

  console.log('\n================ FINAL SYSTEM AUDIT ================');
  console.log(`Total Auth Users: ${finalUsers?.users.length} (Expected: 4)`);
  finalUsers?.users.forEach(u => console.log(`  - ${u.email} (ID: ${u.id})`));
  console.log(`Total Profiles: ${finalProfiles?.length}`);
  finalProfiles?.forEach(p => console.log(`  - ${p.email} | Role: ${p.role} | Name: ${p.full_name}`));
  console.log(`Total Active Subscriptions: ${finalSubs?.filter(s => s.status === 'active').length} (Expected: 3)`);
  finalSubs?.forEach(s => console.log(`  - User ${s.user_id} | Status: ${s.status} | Plan: ${s.plan_type}`));
  console.log('====================================================\n');
}

main().catch(console.error);
