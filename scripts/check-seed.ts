import { createClient } from '@supabase/supabase-js';

async function checkData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const [charities, profiles, draws, subscriptions] = await Promise.all([
    supabase.from('charities').select('id, name, total_raised'),
    supabase.from('profiles').select('id, email, role'),
    supabase.from('draws').select('id, title, status'),
    supabase.from('subscriptions').select('id, status'),
  ]);

  console.log('=== DATABASE RECORD COUNTS ===');
  console.log(`Charities: ${charities.data?.length || 0}`);
  if (charities.data && charities.data.length > 0) {
    console.table(charities.data);
  }

  console.log(`Profiles: ${profiles.data?.length || 0}`);
  if (profiles.data && profiles.data.length > 0) {
    console.table(profiles.data);
  }

  console.log(`Draws: ${draws.data?.length || 0}`);
  console.log(`Subscriptions: ${subscriptions.data?.length || 0}`);
}

checkData();
