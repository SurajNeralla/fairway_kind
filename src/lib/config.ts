export const APP_CONFIG = {
  name: 'FairwayKind',
  description: 'Feel, Not Fairway — Modern Performance & Philanthropy',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
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
