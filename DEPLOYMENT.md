# Digital Heroes — Production Deployment Guide

**Platform**: Digital Heroes Athletic Non-Profit Draw Platform  
**Architecture**: Next.js 14 (App Router), Supabase (Auth, Postgres, Storage), Stripe Billing  
**Security Standard**: Strict Environment Variable Isolation, RLS-Guarded Postgres, PCI-Compliant Billing  

---

## 1. Environment Variables Configuration

Configure the following environment variables in your Vercel Project Settings (**Settings $\to$ Environment Variables**):

| Variable Name | Environment | Description | Example / Placeholder |
|---|:---:|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Dev | Supabase Project URL | `https://rjqqgxczyxrnkvjvlnnr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Dev | Supabase Anonymous Client Key | `[Your Supabase Anon Key]` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | Supabase Service Role Secret (Server-Only) | `[Your Supabase Service Role Key]` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production, Preview, Dev | Stripe Publishable API Key | `pk_test_...` or `pk_live_...` |
| `STRIPE_SECRET_KEY` | Production, Preview, Dev | Stripe Secret API Key (Server-Only) | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Production, Preview, Dev | Stripe Webhook Signing Secret | `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | Production | Canonical Application Domain | `https://your-app.vercel.app` |

> [!IMPORTANT]
> Never commit `.env` or `.env.local` to Git. All secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) must only be entered via Vercel Project Settings or local `.env.local`.

---

## 2. Supabase Configuration

### 2.1 Database Schema & Seed Data
The database schema, triggers, and seed data are maintained in:
- [`supabase/seed.sql`](supabase/seed.sql)

To initialize a new or existing Supabase project:
1. Navigate to **[Supabase Dashboard $\to$ SQL Editor](https://supabase.com/dashboard)**.
2. Paste the full contents of [`supabase/seed.sql`](supabase/seed.sql).
3. Click **Run**.
4. Result: All 11 tables, triggers, RLS policies, 4 partner charities, and the inaugural monthly draw are initialized.

### 2.2 Supabase Storage Configuration
A private bucket named `winner-proofs` is required for scorecard and handicap verification files:
- **Bucket Name**: `winner-proofs`
- **Public Access**: `OFF` (Private)
- **Maximum File Size**: `5242880` (5MB)
- **Allowed MIME Types**: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`
- *Note: This bucket is already created and verified in the active project.*

### 2.3 Authentication & URL Redirects
In **Supabase Dashboard $\to$ Authentication $\to$ URL Configuration**:
- **Site URL**: `https://your-app.vercel.app` (or `http://localhost:3000` for development).
- **Redirect URLs**:
  - `https://your-app.vercel.app/**`
  - `http://localhost:3000/**`
  - `https://your-app.vercel.app/auth/callback`

---

## 3. Stripe Billing & Webhook Configuration

### 3.1 Stripe Products & Plans
The platform supports two subscription tiers:
- **Monthly Plan**: $29 / month
- **Yearly Plan**: $290 / year (Save 17%)
- **Charity Allocation**: Minimum 10% (up to 100%) dynamically calculated and attributed to the user's selected non-profit.

### 3.2 Stripe Webhook Endpoint Setup
In the **[Stripe Dashboard $\to$ Developers $\to$ Webhooks](https://dashboard.stripe.com/test/webhooks)**:
1. Click **Add Endpoint**.
2. **Endpoint URL**: `https://your-app.vercel.app/api/webhooks/stripe`
3. **Events to Send**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing Secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` in Vercel.

---

## 4. Vercel Deployment Instructions

### Method A: Deploy via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/digital-heroes.git
   git push -u origin master
   ```
2. In **[Vercel Dashboard](https://vercel.com/new)**:
   - Click **Add New... $\to$ Project**.
   - Import the `digital-heroes` repository.
   - Set the Framework Preset to **Next.js**.
   - Expand **Environment Variables** and enter the variables listed in Section 1.
   - Click **Deploy**.

### Method B: Deploy via Vercel CLI
```bash
# 1. Authenticate Vercel CLI in your terminal
npx vercel login

# 2. Deploy project
npx vercel --prod
```

---

## 5. Pre-Configured Test Accounts

| Account Type | Email | Password | Role | Default Landing |
|---|---|---|:---:|---|
| **Test Administrator** | `admin@digitalheroes.com` | `Password123!` | `admin` | `/admin` (Admin Control Center) |
| **Test Subscriber** | `subscriber@digitalheroes.com` | `Password123!` | `user` | `/dashboard` (Golfer Dashboard) |

To promote any new user to administrator directly in Supabase SQL:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

---

## 6. Post-Deployment Verification Checklist

Verify the deployed application at your Vercel production URL:

- [ ] **Homepage (`/`)**: Loads hero section, "What You Do", "How You Win", "Charity Impact", and "Subscribe" sections.
- [ ] **Authentication (`/login`, `/signup`)**:
  - Sign up a new user $\to$ verifies entry into `profiles` table.
  - Sign in with `admin@digitalheroes.com` $\to$ verifies `/admin` portal access.
  - Attempting to access `/admin` as an unauthenticated or non-admin user redirects to `/unauthorized`.
- [ ] **Subscriptions (`/subscribe`)**:
  - Toggle between Monthly ($29) and Yearly ($290).
  - Adjust charity slider (10%–100%) $\to$ verifies dynamic contribution calculation.
  - Click checkout $\to$ redirects to Stripe Checkout.
- [ ] **Golf Scores (`/dashboard/scores`)**:
  - Enter score within 1–45 range $\to$ verifies entry.
  - Enter duplicate date $\to$ verifies validation error.
  - Enter 6th score $\to$ verifies rolling-5 behavior (oldest pruned).
- [ ] **Charity Catalog (`/charities`)**:
  - Browse 4 verified 501(c)(3) charities with search and category filters.
- [ ] **Admin Draw Studio (`/admin/draws`)**:
  - Run draw simulation (Random vs Algorithmic mode).
  - Review 5-match, 4-match, 3-match winner distributions and jackpot rollover calculation.
- [ ] **Winner Verification (`/admin/winners`)**:
  - Review uploaded scorecard/handicap proof.
  - Approve/reject with notes.
  - Process payout $\to$ verifies status changed to Paid and duplicate payout prevented.

---

## 7. Known Limitations & Operating Parameters

1. **Non-Gambling Athletic Platform**: Digital Heroes is a skill performance tracker and non-profit allocation platform. All draws and rewards are based on verified Stableford scores.
2. **Scorecard Verification SLA**: Payout eligibility requires manual admin review of proof documents to prevent handicap manipulation.
3. **Stripe Test Mode**: In test mode, use Stripe's standard test card numbers (`4242 4242 4242 4242`) for subscriptions.
