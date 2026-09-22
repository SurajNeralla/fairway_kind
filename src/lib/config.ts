export const APP_CONFIG = {
  name: 'FairwayKind',
  description: 'Feel, Not Fairway — Modern Performance & Philanthropy',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supabase: {
    // Support both standard names and Vercel-generated Supabase integration names
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      'https://rjqqgxczyxrnkvjvlnnr.supabase.co',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcXFneGN6eXhybmt2anZsbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODcxMzUsImV4cCI6MjEwNTU2MzEzNX0.01db-y8FEh_P1lstqzyuo6-m5CrhChSBo7jVs_clFJw',
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcXFneGN6eXhybmt2anZsbm5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTk4NzEzNSwiZXhwIjoyMTA1NTYzMTM1fQ.irHkBT14EMUqoW5knQMdjUBZdxgzZ6kGtIvTp2ZfD_8',
  },
  stripe: {
    publishableKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51UI6bOGKGd3v3DOTgicb4n5XdlNzlvfmbexCyyYfJDdo3ig9C6h3XiCZlEHEK2Ws26b4rkTSfK94XLOespGL1MOX00Df9KqF18',
  },
  draw: {
    minScore: 1,
    maxScore: 45,
    requiredScoresCount: 5,
    minCharityPercentage: 10,
    tier5Percentage: 40,
    tier4Percentage: 35,
    tier3Percentage: 25,
  }
};
