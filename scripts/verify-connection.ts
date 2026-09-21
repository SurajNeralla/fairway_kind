import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

async function verifyConnections() {
  console.log('=== VERIFYING SUPABASE & STRIPE CREDENTIALS ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

  // 1. Supabase Verification
  console.log('1. Checking Supabase Database Connection...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const tablesToCheck = ['profiles', 'charities', 'subscriptions', 'scores', 'draws', 'draw_entries', 'winners', 'winner_proofs', 'payouts', 'charity_contributions', 'audit_logs'];
  const tableStatus: Record<string, string> = {};

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        tableStatus[table] = `Error: ${error.message} (${error.code || ''})`;
      } else {
        tableStatus[table] = 'EXISTS & ACCESSIBLE';
      }
    } catch (err: any) {
      tableStatus[table] = `Exception: ${err.message}`;
    }
  }

  console.log('Supabase Table Status:');
  console.table(tableStatus);

  // 2. Stripe Verification
  console.log('\n2. Checking Stripe API Connection...');
  try {
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-09-30.acacia' as any });
    const balance = await stripe.balance.retrieve();
    console.log('✓ Stripe API Connection SUCCESSFUL!');
    console.log(`  Livemode: ${balance.livemode}`);
    console.log(`  Available Currencies: ${balance.available.map((b) => b.currency).join(', ') || 'None (Test Mode)'}`);
  } catch (err: any) {
    console.error('✗ Stripe API Error:', err.message);
  }
}

verifyConnections();
