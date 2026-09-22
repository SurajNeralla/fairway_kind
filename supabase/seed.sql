-- ============================================================================
-- DIGITAL HEROES — COMPLETE PRODUCTION SCHEMA & SEED SCRIPT
-- Copy and paste this into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rjqqgxczyxrnkvjvlnnr/sql
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerations
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('monthly', 'yearly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE prize_tier AS ENUM ('tier_5_match', 'tier_4_match', 'tier_3_match', 'none');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE proof_status AS ENUM ('pending_submission', 'submitted', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('unpaid', 'pending', 'paid', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Partner Charities Table
CREATE TABLE IF NOT EXISTS public.charities (
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

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_type plan_type NOT NULL DEFAULT 'monthly',
  status subscription_status NOT NULL DEFAULT 'incomplete',
  charity_id UUID REFERENCES public.charities(id),
  voluntary_charity_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (voluntary_charity_percent >= 10.00 AND voluntary_charity_percent <= 100.00),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- 6. Golf Scores Table (Max 5 active scores, range 1-45, 1 score per date)
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_on DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_played_on UNIQUE (user_id, played_on)
);

-- 7. Monthly Draws Table
CREATE TABLE IF NOT EXISTS public.draws (
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

-- 8. Draw Entries Table
CREATE TABLE IF NOT EXISTS public.draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_numbers INTEGER[] NOT NULL CHECK (array_length(entry_numbers, 1) = 5),
  score_ids UUID[] NOT NULL,
  match_count INTEGER NOT NULL DEFAULT 0 CHECK (match_count BETWEEN 0 AND 5),
  prize_tier prize_tier NOT NULL DEFAULT 'none',
  prize_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_draw_entry UNIQUE (draw_id, user_id)
);

-- 9. Winners Table
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  draw_entry_id UUID NOT NULL REFERENCES public.draw_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_count INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
  prize_tier prize_tier NOT NULL,
  prize_amount NUMERIC(12, 2) NOT NULL,
  proof_status proof_status NOT NULL DEFAULT 'pending_submission',
  payout_status payout_status NOT NULL DEFAULT 'unpaid',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Winner Proofs Table
CREATE TABLE IF NOT EXISTS public.winner_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID NOT NULL REFERENCES public.winners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proof_file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  status proof_status NOT NULL DEFAULT 'submitted',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID NOT NULL REFERENCES public.winners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  transaction_reference TEXT,
  status payout_status NOT NULL DEFAULT 'pending',
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Charity Contributions Log Table
CREATE TABLE IF NOT EXISTS public.charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id),
  draw_id UUID REFERENCES public.draws(id),
  amount NUMERIC(10, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Trigger Function to Maintain Top 5 Scores per User
CREATE OR REPLACE FUNCTION maintain_top_5_scores()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Prevent infinite recursion
  IF pg_trigger_depth() > 1 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;

  -- Mark all scores for this user as inactive first
  UPDATE public.scores SET is_active = false WHERE user_id = target_user_id;
  
  -- Re-activate only the top 5 newest played_on scores
  UPDATE public.scores 
  SET is_active = true 
  WHERE id IN (
    SELECT id FROM public.scores 
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

DROP TRIGGER IF EXISTS trigger_maintain_top_5_scores ON public.scores;
CREATE TRIGGER trigger_maintain_top_5_scores
AFTER INSERT OR UPDATE OR DELETE ON public.scores
FOR EACH ROW EXECUTE FUNCTION maintain_top_5_scores();

-- 15. Profile Auto-Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  parsed_role public.user_role := 'user';
BEGIN
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'role' = 'admin' THEN
    parsed_role := 'admin'::public.user_role;
  ELSE
    parsed_role := 'user'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Golfer Hero'),
    parsed_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback insertion to guarantee user registration never fails
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, COALESCE(NEW.email, ''), 'Golfer Hero', 'user'::public.user_role)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- 17. Row Level Security Policies
CREATE OR REPLACE FUNCTION public.prevent_user_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Privilege escalation forbidden: Only administrators can modify user roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_role_escalation();

DROP POLICY IF EXISTS "Public profiles reading" ON public.profiles;
CREATE POLICY "Public profiles reading" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    public.is_admin() OR (auth.uid() = id AND role = 'user'::public.user_role)
  );

DROP POLICY IF EXISTS "Public charities reading" ON public.charities;
CREATE POLICY "Public charities reading" ON public.charities FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users read own subscription" ON public.subscriptions;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own scores" ON public.scores;
CREATE POLICY "Users read own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own scores" ON public.scores;
CREATE POLICY "Users insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own scores" ON public.scores;
CREATE POLICY "Users update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own scores" ON public.scores;
CREATE POLICY "Users delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read published draws" ON public.draws;
CREATE POLICY "Public read published draws" ON public.draws FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users read own draw entries" ON public.draw_entries;
CREATE POLICY "Users read own draw entries" ON public.draw_entries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own wins" ON public.winners;
CREATE POLICY "Users read own wins" ON public.winners FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users upload own proof" ON public.winner_proofs;
CREATE POLICY "Users upload own proof" ON public.winner_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own proof" ON public.winner_proofs;
CREATE POLICY "Users read own proof" ON public.winner_proofs FOR SELECT USING (auth.uid() = user_id);

-- 18. SEED DATA: 4 Vetted Partner Charities
INSERT INTO public.charities (id, name, description, category, total_raised, is_active)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'Akshaya Patra Foundation',
    'Provides nutritious mid-day meals to children in schools across India, helping reduce classroom hunger and support education.',
    'Education & Nutrition',
    384200.00,
    true
  ),
  (
    'c2000000-0000-0000-0000-000000000002',
    'CRY – Child Rights and You',
    'Works to protect children''s rights by supporting access to education, healthcare, nutrition, and protection from exploitation.',
    'Child Rights & Healthcare',
    291500.00,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'Goonj',
    'Uses clothing and other essential materials as a resource for community development, disaster relief, and rural empowerment.',
    'Community Development & Relief',
    410000.00,
    true
  ),
  (
    'c4000000-0000-0000-0000-000000000004',
    'Teach For India',
    'Works to improve educational opportunities for children from underserved communities through teaching and leadership programs.',
    'Education & Leadership',
    325000.00,
    true
  ),
  (
    'c5000000-0000-0000-0000-000000000005',
    'Smile Foundation',
    'Supports underserved communities through initiatives focused on education, healthcare, livelihood development, and social empowerment.',
    'Healthcare & Livelihood',
    275000.00,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  total_raised = EXCLUDED.total_raised;

-- 19. SEED DATA: Inaugural Monthly Draw (September 2026)
INSERT INTO public.draws (
  id,
  title,
  period_month,
  period_year,
  draw_date,
  status,
  mode,
  winning_numbers,
  total_prize_pool,
  tier_5_pool,
  tier_4_pool,
  tier_3_pool,
  rollover_amount
)
VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'FairwayKind Inaugural Monthly Draw — 9/2026',
  9,
  2026,
  NOW(),
  'published',
  'random',
  ARRAY[7, 14, 23, 31, 42],
  25000.00,
  10000.00,
  8750.00,
  6250.00,
  5000.00
)
ON CONFLICT (period_month, period_year) DO NOTHING;
