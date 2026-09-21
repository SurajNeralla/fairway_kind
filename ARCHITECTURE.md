# Digital Heroes — System Architecture & Technical Specification

## 1. System Overview

Digital Heroes is a subscription-based golf performance, charity impact, and monthly prize draw platform built with Next.js 14 (App Router), Supabase (PostgreSQL, Auth, RLS, Storage), and Stripe. 

The application connects golf scoring (Stableford format, 1–45) with social impact and gamified monthly rewards:
- **Golfers** maintain their latest 5 golf scores, choose a charity to receive a minimum 10% (up to 100%) contribution from their subscription fee, and automatically participate in monthly draws based on their score numbers.
- **Winners** receive prize payouts upon uploading verified proof.
- **Administrators** control user access, audit scores, simulate and publish monthly draws, manage charity allocations, review winner proof submissions, and approve payouts.

---

## 2. Technology Stack & Architectural Overview

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              CLIENT LAYER                              │
 │   Next.js 14 App Router (React, TypeScript, Tailwind CSS, Motion)     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
       ┌───────────────────────────┐   ┌───────────────────────────┐
       │   Public & User Routes    │   │       Admin Portal        │
       │  (/, /auth, /dashboard)   │   │     (/admin/* - RBAC)     │
       └─────────────┬─────────────┘   └─────────────┬─────────────┘
                     │                               │
 ┌───────────────────┴───────────────────────────────┴────────────────────┐
 │                            API & SERVER                            │
 │              Next.js Route Handlers & Server Actions                   │
 └─────────────┬─────────────────────┬─────────────────────┬──────────────┘
               │                     │                     │
               ▼                     ▼                     ▼
 ┌─────────────────────────┐ ┌───────────────┐ ┌──────────────────────────┐
 │    SUPABASE ENGINE      │ │ STRIPE API    │ │     DRAW SIMULATOR &     │
 │ • Auth (JWT + Session)  │ │ • Checkout    │ │      MATCHING ENGINE     │
 │ • PostgreSQL DB + RLS   │ │ • Billing     │ │ • Random / Algorithmic   │
 │ • File Storage (Proofs) │ │ • Webhooks    │ │ • Tier Payout Splits     │
 └─────────────────────────┘ └───────────────┘ └──────────────────────────┘
```

### Core Technologies
- **Frontend Framework**: Next.js 14 (App Router) with TypeScript & React Server Components.
- **Styling & Motion**: Tailwind CSS + Custom Design System (modern dark glassmorphism aesthetic, dynamic micro-animations, vibrant gradient accents—avoiding traditional golf clichés).
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth with Row Level Security, Supabase Storage for secure PDF/Image winner proof uploads).
- **Payment Processing**: Stripe API (Checkout Sessions, Billing Customer Portal, Webhooks for async subscription sync).
- **Deployment**: Vercel platform with environment variable isolation.

---

## 3. Database Architecture & ERD Description

### Core Entities & Relationships

```
                     ┌────────────────┐
                     │  auth.users    │
                     └───────┬────────┘
                             │ 1:1
                             ▼
                     ┌────────────────┐
                     │    profiles    │ (id, email, full_name, role)
                     └───────┬────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │ 1:M                   │ 1:M                   │ 1:M
     ▼                       ▼                       ▼
┌───────────────┐   ┌─────────────────┐   ┌───────────────────┐
│ subscriptions │   │     scores      │   │    charities      │
│ (Stripe sync) │   │ (Max 5, 1-45)   │   │ (Impact catalog)  │
└───────┬───────┘   └────────┬────────┘   └─────────┬─────────┘
        │                    │                      │
        │ 1:M                │ M:N (Draw entry)     │ 1:M
        ▼                    ▼                      ▼
┌───────────────────┐ ┌───────────────┐   ┌───────────────────┐
│charity_contribs   │ │ draw_entries  │   │ charity_payouts   │
└───────────────────┘ └───────┬───────┘   └───────────────────┘
                              │ 1:1
                              ▼
                      ┌───────────────┐
                      │    winners    │
                      └───────┬───────┘
                              │ 1:1
                              ▼
                      ┌───────────────┐
                      │ winner_proofs │
                      └───────┬───────┘
                              │ 1:1
                              ▼
                      ┌───────────────┐
                      │    payouts    │
                      └───────────────┘
```

### Detailed Table Definitions & SQL Schemas

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE plan_type AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published', 'completed');
CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
CREATE TYPE prize_tier AS ENUM ('tier_5_match', 'tier_4_match', 'tier_3_match', 'none');
CREATE TYPE proof_status AS ENUM ('pending_submission', 'submitted', 'approved', 'rejected');
CREATE TYPE payout_status AS ENUM ('unpaid', 'pending', 'paid', 'failed');

-- Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charities Table
CREATE TABLE charities (
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
CREATE TABLE subscriptions (
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
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_on DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_played_on UNIQUE (user_id, played_on)
);

-- Monthly Draws Table
CREATE TABLE draws (
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
CREATE TABLE draw_entries (
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
CREATE TABLE winners (
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
CREATE TABLE winner_proofs (
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
CREATE TABLE payouts (
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

-- Charity Contributions Table
CREATE TABLE charity_contributions (
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
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Key Database Constraints & Logic Triggers

1. **Date Uniqueness Constraint**: `UNIQUE (user_id, played_on)` guarantees only 1 score per user per date.
2. **Score Range Constraint**: `CHECK (score >= 1 AND score <= 45)` enforces valid Stableford score numbers.
3. **Max 5 Active Scores Automated Trimming Trigger**:
   ```sql
   -- Trigger function to maintain strictly 5 active scores per user
   CREATE OR REPLACE FUNCTION maintain_top_5_scores()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Set all scores for this user to inactive first
     UPDATE scores SET is_active = false WHERE user_id = NEW.user_id;
     
     -- Activate only the 5 newest played_on dates for this user
     UPDATE scores 
     SET is_active = true 
     WHERE id IN (
       SELECT id FROM scores 
       WHERE user_id = NEW.user_id 
       ORDER BY played_on DESC, created_at DESC 
       LIMIT 5
     );
     
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_maintain_top_5_scores
   AFTER INSERT OR UPDATE OR DELETE ON scores
   FOR EACH ROW EXECUTE FUNCTION maintain_top_5_scores();
   ```

4. **Row Level Security (RLS) Rules**:
   - `profiles`: Users can SELECT own profile. Admins SELECT all.
   - `scores`: Users can CRUD own scores. Admins SELECT all scores.
   - `subscriptions`: Users can SELECT own subscription. Server role/webhooks UPDATE.
   - `draws`: Public/Users can SELECT `published` draws. Admins CRUD all draws.
   - `winners`: Users SELECT own win records. Admins CRUD all.
   - `winner_proofs`: Users INSERT/SELECT own proof files. Admins SELECT/UPDATE review status.

---

## 5. System Flows & Lifecycle Architecture

### 5.1 Authentication Flow
1. User registers via `/auth/register` (Email + Password or Supabase OAuth).
2. Supabase Auth generates JWT and triggers creation of `profiles` row with default role `user`.
3. Middleware inspects session JWT; unauthenticated requests to `/dashboard/*` or `/admin/*` are redirected to `/auth/login`.

### 5.2 Subscription & Payment Flow
1. User selects Monthly or Yearly plan on `/dashboard/subscription` and selects a charity with voluntary contribution % (10% to 100%).
2. API route creates a Stripe Checkout Session with metadata (`user_id`, `charity_id`, `contribution_pct`).
3. Upon payment, Stripe sends `checkout.session.completed` webhook to `/api/webhooks/stripe`.
4. Webhook updates/creates `subscriptions` record to `status = 'active'`, updates `charity_contributions` log.
5. User gains active access to monthly draws and score submission dashboard.

### 5.3 Score Management Flow
1. User navigates to `/dashboard/scores`.
2. Form submits new Stableford score (1–45) + Date (`played_on`).
3. Database constraint verifies no duplicate date exists for `user_id`.
4. `maintain_top_5_scores()` trigger updates `is_active` flags so only the latest 5 dates remain active.
5. Dashboard renders active 5 scores ordered newest date first.

### 5.4 Monthly Draw Engine Flow

#### Mathematical Logic
- **Prize Pool Breakdown**:
  $$ \text{Tier 5 Pool} = (\text{Total Prize Pool} \times 0.40) + \text{Rollover Amount} $$
  $$ \text{Tier 4 Pool} = \text{Total Prize Pool} \times 0.35 $$
  $$ \text{Tier 3 Pool} = \text{Total Prize Pool} \times 0.25 $$

- **Matching Logic**:
  Given draw winning numbers $W = [w_1, w_2, w_3, w_4, w_5]$ and user active 5 scores $U = [u_1, u_2, u_3, u_4, u_5]$:
  $$\text{Match Count} = |\{ x \in U \mid x \in W \}|$$
  - `5 Matches` $\rightarrow$ `tier_5_match` (40% pool split equally among Tier 5 winners). If count $= 0$, entire Tier 5 Pool rolls over to next month's `rollover_amount`.
  - `4 Matches` $\rightarrow$ `tier_4_match` (35% pool split equally among Tier 4 winners).
  - `3 Matches` $\rightarrow$ `tier_3_match` (25% pool split equally among Tier 3 winners).
  - `< 3 Matches` $\rightarrow$ `none`.

#### Draw Execution Flow
1. Admin opens `/admin/draws` for target month/year.
2. System fetches all active subscriptions with 5 active scores.
3. **Simulation Phase**: Admin clicks "Simulate Draw" (Random draw generation or specific test seed).
4. System executes match algorithm against entries, calculates prize pools, displays simulated winner list, tier counts, and payout amounts.
5. **Publish Phase**: Admin clicks "Publish Draw". Draw status changes to `published`. `draw_entries` and `winners` records are committed to the DB. Unclaimed 5-match pool is flagged as rollover for next cycle.

### 5.5 Winner Verification & Payout Flow
1. User logs into `/dashboard/winnings`, sees win alert for published draw.
2. User uploads proof document (golf club handicap certificate/official scorecard PDF or screenshot) to Supabase Storage.
3. Record created in `winner_proofs` with `status = 'submitted'`. Winner state becomes `submitted`.
4. Admin reviews proof in `/admin/winners`:
   - If **Approved**: `winner_proofs.status = 'approved'`, `winners.proof_status = 'approved'`, `payouts` record initialized to `pending`.
   - If **Rejected**: Admin specifies reason; user receives notification to re-upload.
5. Admin processes payment via `/admin/payouts`: updates payout state from `pending` to `paid` with bank transaction reference.

---

## 6. Major Application Route Structure

### Public Routes
- `/` — Modern landing page with interactive charity impact showcase, monthly draw explanation, transparent prize pool breakdowns, and subscription pricing.
- `/charities` — Directory of registered charity partners with impact stats and filterable causes.
- `/auth/login` — Account sign-in.
- `/auth/register` — Account registration.

### Protected User Dashboard (`/dashboard/*`)
- `/dashboard` — Main overview: Subscription status badge, latest 5 scores grid, chosen charity card, draw countdown, recent winnings summary.
- `/dashboard/scores` — Interactive score manager (add/delete score with date picker and range validation 1-45, displaying active top 5 newest first).
- `/dashboard/subscription` — Manage plan (Monthly/Yearly), adjust voluntary charity contribution slider (10%-100%), access Stripe Customer Portal.
- `/dashboard/draws` — Draw history timeline, past entry numbers vs winning numbers match visualizer.
- `/dashboard/winnings` — Winnings claim center, upload winner proof, track approval and payout status.

### Admin Portal (`/admin/*` - Requires `role = 'admin'`)
- `/admin` — High-level KPI metrics dashboard (Active Subscribers, Monthly Recurring Revenue, Total Charity Pool Raised, Active Draw Status).
- `/admin/users` — User management table with subscription status filter, score audit link, and role modifiers.
- `/admin/scores` — Platform-wide score audit viewer and manual override controls.
- `/admin/draws` — Draw control studio: Create draw, select draw mode (random vs algorithmic seed), run live simulation, inspect tier splits, publish results.
- `/admin/charities` — Charity management CRUD (Add new cause, edit description, upload logo, inspect total funds raised).
- `/admin/winners` — Proof verification queue: Side-by-side view of user score entry and uploaded proof file, Approve/Reject buttons with reason modal.
- `/admin/payouts` — Financial payout ledger: Mark payouts as processing/paid, enter transaction reference codes.
- `/admin/reports` — Advanced analytics: Revenue breakdown, prize pool allocations, rollover metrics, charity impact reports.

---

## 7. Security & Role-Based Access Control (RBAC)

- **Client-Side Protection**: Modern Next.js layout wrappers and middleware check JWT claims. Non-admin access to `/admin/*` triggers instant 403 Forbidden redirect.
- **Server-Side Protection**: Server Actions & API Route Handlers enforce session token verification and Supabase RLS context.
- **Environment Isolation**:
  - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` exposed safely to client.
  - `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` kept strictly server-side.

---

## 8. Development & Deployment Pipeline

- **Repository Structure**: Single clean Next.js 14 project.
- **Database Migrations**: SQL migration scripts stored in `/supabase/migrations`.
- **Deployment Platform**: Vercel.
- **Environment Variables Checklist**:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
