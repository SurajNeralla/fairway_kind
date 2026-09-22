import { createClient } from '@supabase/supabase-js';

async function seedInitialData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('1. Checking and creating storage bucket "winner-proofs"...');
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error('List buckets error:', bucketsErr.message);
  } else {
    const hasProofBucket = buckets.some((b) => b.name === 'winner-proofs');
    if (!hasProofBucket) {
      const { data: newBucket, error: createBucketErr } = await supabase.storage.createBucket('winner-proofs', {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      });
      if (createBucketErr) {
        console.error('Create bucket error:', createBucketErr.message);
      } else {
        console.log('✓ Created private bucket "winner-proofs" successfully!');
      }
    } else {
      console.log('✓ Bucket "winner-proofs" already exists.');
    }
  }

  console.log('\n2. Seeding partner charities...');
  const initialCharities = [
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Akshaya Patra Foundation',
      description: 'Provides nutritious mid-day meals to children in schools across India, helping reduce classroom hunger and support education.',
      category: 'Education & Nutrition',
      total_raised: 384200.00,
      is_active: true,
    },
    {
      id: 'c2000000-0000-0000-0000-000000000002',
      name: 'CRY – Child Rights and You',
      description: "Works to protect children's rights by supporting access to education, healthcare, nutrition, and protection from exploitation.",
      category: 'Child Rights & Healthcare',
      total_raised: 291500.00,
      is_active: true,
    },
    {
      id: 'c3000000-0000-0000-0000-000000000003',
      name: 'Goonj',
      description: 'Uses clothing and other essential materials as a resource for community development, disaster relief, and rural empowerment.',
      category: 'Community Development & Relief',
      total_raised: 410000.00,
      is_active: true,
    },
    {
      id: 'c4000000-0000-0000-0000-000000000004',
      name: 'Teach For India',
      description: 'Works to improve educational opportunities for children from underserved communities through teaching and leadership programs.',
      category: 'Education & Leadership',
      total_raised: 325000.00,
      is_active: true,
    },
    {
      id: 'c5000000-0000-0000-0000-000000000005',
      name: 'Smile Foundation',
      description: 'Supports underserved communities through initiatives focused on education, healthcare, livelihood development, and social empowerment.',
      category: 'Healthcare & Livelihood',
      total_raised: 275000.00,
      is_active: true,
    },
  ];

  const { data: insertedCharities, error: insertErr } = await supabase
    .from('charities')
    .upsert(initialCharities, { onConflict: 'id' })
    .select();

  if (insertErr) {
    console.error('Charity seed error:', insertErr.message);
  } else {
    console.log(`✓ Seeded ${insertedCharities?.length || 0} partner charities!`);
  }

  console.log('\n3. Seeding an initial published draw (September 2026)...');
  const initialDraw = {
    id: 'd1000000-0000-0000-0000-000000000001',
    title: 'Digital Heroes Inaugural Monthly Draw — 9/2026',
    period_month: 9,
    period_year: 2026,
    draw_date: new Date().toISOString(),
    status: 'published',
    mode: 'random',
    winning_numbers: [7, 14, 23, 31, 42],
    total_prize_pool: 25000.00,
    tier_5_pool: 10000.00,
    tier_4_pool: 8750.00,
    tier_3_pool: 6250.00,
    rollover_amount: 5000.00,
  };

  const { data: draw, error: drawErr } = await supabase
    .from('draws')
    .upsert([initialDraw], { onConflict: 'id' })
    .select();

  if (drawErr) {
    console.log('Draw seed note:', drawErr.message);
  } else {
    console.log(`✓ Seeded published draw: ${draw?.[0]?.title}`);
  }
}

seedInitialData();
