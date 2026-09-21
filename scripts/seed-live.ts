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
      name: 'Youth on Course Foundation',
      description: 'Providing junior golfers underrepresented in sport access to play for $5 per round at 2,000+ facilities.',
      category: 'Youth & Sports Access',
      total_raised: 384200.00,
      is_active: true,
    },
    {
      id: 'c2000000-0000-0000-0000-000000000002',
      name: 'Clean Oceans & Coastal Wetlands',
      description: 'Restoring marine ecosystems, protecting coastal golf link habitats, and removing plastic pollutants.',
      category: 'Environment & Climate',
      total_raised: 291500.00,
      is_active: true,
    },
    {
      id: 'c3000000-0000-0000-0000-000000000003',
      name: 'St. Jude Children’s Research Hospital',
      description: 'Leading the way the world understands, treats and defeats childhood cancer and other life-threatening diseases.',
      category: 'Pediatric Health',
      total_raised: 520800.00,
      is_active: true,
    },
    {
      id: 'c4000000-0000-0000-0000-000000000004',
      name: 'Veterans Golf Healing Alliance',
      description: 'Empowering military veterans through adaptive golf rehabilitation and mental health support networks.',
      category: 'Veteran Welfare',
      total_raised: 185400.00,
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
