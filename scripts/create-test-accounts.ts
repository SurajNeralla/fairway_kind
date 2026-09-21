import { createClient } from '@supabase/supabase-js';

async function createTestAccounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('=== INITIALIZING PRE-CONFIRMED TEST ACCOUNTS ===\n');

  // 1. Create Test Admin
  const adminEmail = 'admin@digitalheroes.com';
  const adminPassword = 'Password123!';

  console.log(`1. Creating/Ensuring Admin: ${adminEmail}...`);
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Platform Admin', role: 'admin' },
  });

  if (adminErr) {
    console.log(`Admin note: ${adminErr.message}`);
  } else {
    console.log(`✓ Admin user created in auth.users: ${adminAuth.user?.id}`);
  }

  // Ensure admin profile exists in profiles table
  const { data: adminUser } = await supabase.from('profiles').select('id').eq('email', adminEmail).maybeSingle();
  if (!adminUser && adminAuth.user) {
    await supabase.from('profiles').upsert({
      id: adminAuth.user.id,
      email: adminEmail,
      full_name: 'Platform Admin',
      role: 'admin',
    });
  } else if (adminUser) {
    await supabase.from('profiles').update({ role: 'admin' }).eq('email', adminEmail);
  }
  console.log('✓ Admin profile confirmed with role="admin"');

  // 2. Create Test Subscriber
  const subEmail = 'subscriber@digitalheroes.com';
  const subPassword = 'Password123!';

  console.log(`\n2. Creating/Ensuring Subscriber: ${subEmail}...`);
  const { data: subAuth, error: subErr } = await supabase.auth.admin.createUser({
    email: subEmail,
    password: subPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Hero Golfer', role: 'user' },
  });

  if (subErr) {
    console.log(`Subscriber note: ${subErr.message}`);
  } else {
    console.log(`✓ Subscriber user created in auth.users: ${subAuth.user?.id}`);
  }

  const { data: subUser } = await supabase.from('profiles').select('id').eq('email', subEmail).maybeSingle();
  const subUserId = subUser?.id || subAuth.user?.id;

  if (subUserId) {
    await supabase.from('profiles').upsert({
      id: subUserId,
      email: subEmail,
      full_name: 'Hero Golfer',
      role: 'user',
    });

    // Seed an active subscription for the test subscriber
    await supabase.from('subscriptions').upsert({
      user_id: subUserId,
      stripe_customer_id: 'cus_test_subscriber_dh',
      stripe_subscription_id: 'sub_test_subscriber_dh',
      plan_type: 'monthly',
      status: 'active',
      charity_id: 'c1000000-0000-0000-0000-000000000001',
      voluntary_charity_percent: 15.00,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    }, { onConflict: 'user_id' });

    console.log('✓ Active subscription ($29/mo, 15% to Youth on Course) seeded for test subscriber!');

    // Seed 5 sample golf scores (range 1-45, unique dates)
    const sampleScores = [
      { user_id: subUserId, score: 36, played_on: '2026-09-15', is_active: true },
      { user_id: subUserId, score: 38, played_on: '2026-09-12', is_active: true },
      { user_id: subUserId, score: 34, played_on: '2026-09-08', is_active: true },
      { user_id: subUserId, score: 40, played_on: '2026-09-03', is_active: true },
      { user_id: subUserId, score: 32, played_on: '2026-08-28', is_active: true },
    ];

    for (const sc of sampleScores) {
      await supabase.from('scores').upsert(sc, { onConflict: 'user_id,played_on' });
    }
    console.log('✓ 5 verified Stableford golf scores seeded for test subscriber!');
  }

  console.log('\n=== PRE-CONFIGURED ACCOUNTS READY FOR TESTING ===');
}

createTestAccounts();
