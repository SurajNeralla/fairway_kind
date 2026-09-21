-- Migration: 0001_initial_schema.sql
-- Description: Complete initial schema for Digital Heroes platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE plan_type AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published', 'completed');
CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
CREATE TYPE prize_tier AS ENUM ('tier_5_match', 'tier_4_match', 'tier_3_match', 'none');
CREATE TYPE proof_status AS ENUM ('pending_submission', 'submitted', 'approved', 'rejected');
CREATE TYPE payout_status AS ENUM ('unpaid', 'pending', 'paid', 'failed');

-- Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charities Table
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  total_raised NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_type plan_type NOT NULL DEFAULT 'monthly',
  status subscription_status NOT NULL DEFAULT 'incomplete',
  charity_id UUID REFERENCES charities(id),
  voluntary_charity_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (voluntary_charity_percent >= 10.00 AND voluntary_charity_percent <= 100.00),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Golf Scores Table (Max 5 active scores, range 1-45, 1 score per date)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_on DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_played_on UNIQUE (user_id, played_on)
);

-- Monthly Draws Table
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL CHECK (period_year >= 2024),
  draw_date TIMESTAMPTZ NOT NULL,
  status draw_status NOT NULL DEFAULT 'draft',
  mode draw_mode NOT NULL DEFAULT 'random',
  winning_numbers INTEGER[] CHECK (array_length(winning_numbers, 1) = 5),
  total_prize_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tier_5_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- 40%
  tier_4_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- 35%
  tier_3_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- 25%
  rollover_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_draw_period UNIQUE (period_month, period_year)
);

-- Draw Entries Table
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_numbers INTEGER[] NOT NULL CHECK (array_length(entry_numbers, 1) = 5),
  score_ids UUID[] NOT NULL,
  match_count INTEGER NOT NULL DEFAULT 0 CHECK (match_count BETWEEN 0 AND 5),
  prize_tier prize_tier NOT NULL DEFAULT 'none',
  prize_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_draw_entry UNIQUE (draw_id, user_id)
);

-- Winners Table
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  draw_entry_id UUID NOT NULL REFERENCES draw_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_count INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
  prize_tier prize_tier NOT NULL,
  prize_amount NUMERIC(12, 2) NOT NULL,
  proof_status proof_status NOT NULL DEFAULT 'pending_submission',
  payout_status payout_status NOT NULL DEFAULT 'unpaid',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Winner Proofs Table
CREATE TABLE IF NOT EXISTS winner_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID NOT NULL REFERENCES winners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proof_file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  status proof_status NOT NULL DEFAULT 'submitted',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payouts Table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID NOT NULL REFERENCES winners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  transaction_reference TEXT,
  status payout_status NOT NULL DEFAULT 'pending',
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charity Contributions Log Table
CREATE TABLE IF NOT EXISTS charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id),
  draw_id UUID REFERENCES draws(id),
  amount NUMERIC(10, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger function to retain ONLY top 5 newest played_on scores per user
CREATE OR REPLACE FUNCTION maintain_top_5_scores()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;

  -- Mark all scores for this user as inactive first
  UPDATE scores SET is_active = false WHERE user_id = target_user_id;
  
  -- Re-activate only the top 5 newest played_on scores
  UPDATE scores 
  SET is_active = true 
  WHERE id IN (
    SELECT id FROM scores 
    WHERE user_id = target_user_id 
    ORDER BY played_on DESC, created_at DESC 
    LIMIT 5
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger definition
DROP TRIGGER IF EXISTS trigger_maintain_top_5_scores ON scores;
CREATE TRIGGER trigger_maintain_top_5_scores
AFTER INSERT OR UPDATE OR DELETE ON scores
FOR EACH ROW EXECUTE FUNCTION maintain_top_5_scores();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public profiles reading" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public charities reading" ON charities FOR SELECT USING (is_active = true);
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Users read own draw entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own wins" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upload own proof" ON winner_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own proof" ON winner_proofs FOR SELECT USING (auth.uid() = user_id);
