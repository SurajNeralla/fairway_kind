# Digital Heroes — Phase-by-Phase Implementation Plan

To ensure a robust, production-quality release that adheres strictly to the single source of truth (PRD), Digital Heroes is structured into 9 incremental phases. Each phase builds upon verified foundations.

---

## Phase Overview & Roadmap

```
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 0: Project Architecture & Planning (COMPLETED)   │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 1: Project Foundation, Design System & Auth      │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 2: Subscriptions, Stripe Billing & Charity Core  │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 3: Golf Score Management Engine                  │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 4: Monthly Draw Engine & Simulation Studio       │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 5: Winner Verification & Payout Pipeline         │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 6: Admin Portal, User Management & Analytics     │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 7: Visual Polish, Motion Enhancement & UX States │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ PHASE 8: E2E Verification, Security Audit & Deployment │
  └────────────────────────────────────────────────────────┘
```

---

## Phase Details

### Phase 0: Architecture & Project Planning (Current Phase)
- **Goals**: Define system topology, database ERD, route structure, RBAC model, draw math logic, PRD ambiguity resolutions, and architecture docs.
- **Deliverables**: `ARCHITECTURE.md`, `PHASE_PLAN.md`, `implementation_plan.md`.

### Phase 1: Base Setup, Design System, Database Migrations & Auth
- **Goals**:
  - Initialize Next.js 14 project with TypeScript, Tailwind CSS, Lucide Icons, and Framer Motion.
  - Implement non-cliché modern design system (vibrant gradient accents, dark glassmorphism, responsive grid).
  - Write SQL database migrations for all tables, enums, indexes, and triggers (`maintain_top_5_scores`).
  - Configure Supabase Auth client & middleware for route protection (`/dashboard`, `/admin`).
  - Build Auth UI (Login & Register with error/loading feedback).
- **Deliverables**: Runnable Next.js project, database migration scripts, auth flows, protected layout shells.

### Phase 2: User Subscriptions, Stripe Billing & Charity Integration
- **Goals**:
  - Integrate Stripe Checkout API for Monthly & Yearly subscription plans.
  - Implement Charity Selection catalog with voluntary contribution slider (10% min up to 100%).
  - Set up Stripe Webhooks handler (`/api/webhooks/stripe`) to synchronize subscription state (`active`, `canceled`, etc.).
  - Implement gating logic ensuring draw entry and score access require an active subscription.
- **Deliverables**: Subscription management page, Stripe integration abstraction, charity selection, webhook sync.

### Phase 3: Golf Score Engine (1-45 Range & Top 5 Trimming)
- **Goals**:
  - Build score management API and Server Actions.
  - Implement form validation enforcing score range (1–45) and single score per user per date (`played_on`).
  - Verify database trigger `maintain_top_5_scores` automatically retains only the top 5 newest scores.
  - Build interactive score management UI with date picker, score list visualizer, and empty/loading states.
- **Deliverables**: Score CRUD system, automated 5-score limit enforcement, score dashboard component.

### Phase 4: Monthly Draw Engine & Simulation Studio
- **Goals**:
  - Build draw matching algorithm ($5$-match, $4$-match, $3$-match counting logic).
  - Build prize pool calculation engine (40% Tier 5, 35% Tier 4, 25% Tier 3, unclaimed Tier 5 rollover tracking).
  - Implement Admin Draw Studio for configuring monthly draws (Random vs Algorithmic mode).
  - Implement Draw Simulation mode allowing admins to test draws and inspect prize distributions before publishing.
  - Implement Draw Publishing workflow to lock entries and declare winners.
- **Deliverables**: Draw calculation engine, Admin simulation studio, user draw history & match visualizer.

### Phase 5: Winner Verification & Payout Pipeline
- **Goals**:
  - Build User Winnings Center (`/dashboard/winnings`).
  - Implement Supabase Storage bucket integration for secure winner proof uploads (handicap certificates / official scorecards).
  - Build Admin Winner Proof Verification Queue (`/admin/winners`) with side-by-side inspection, approve/reject controls, and feedback modals.
  - Build Payout Management workflow (`/admin/payouts`) tracking payout state (`unpaid` $\rightarrow$ `pending` $\rightarrow$ `paid`).
- **Deliverables**: Proof upload pipeline, admin proof verification UI, payout transaction recorder.

### Phase 6: Admin Control Center & Reporting Analytics
- **Goals**:
  - Build comprehensive Admin Dashboard overview (`/admin`).
  - Implement User Management table with search, role modification, and score auditing.
  - Implement Charity Management CRUD (Add/edit causes, upload logos, inspect charity raise totals).
  - Build System Reporting & Analytics page (`/admin/reports`) with charts for revenue, charity totals, prize pools, and draw statistics.
- **Deliverables**: Full admin control suite, user management, charity administration, reporting dashboard.

### Phase 7: Visual Polish, Motion Enhancement & UX States
- **Goals**:
  - Apply motion micro-animations (Framer Motion page transitions, hover states, pulse glow effects).
  - Audit all UI components for responsive perfection on Mobile, Tablet, and Desktop.
  - Ensure pristine Empty, Loading (skeletons), Error, and Success feedback across all forms and data tables.
  - Fine-tune color harmony and contrast to ensure an emotional, high-end experience.
- **Deliverables**: Polished visual interface w/ dynamic micro-interactions across the app.

### Phase 8: E2E Verification, Security Audit & Deployment Readiness
- **Goals**:
  - Run build validation (`npm run build`), TypeScript type checking, and linting.
  - Verify RLS policies, RBAC route guards, environment variable safety, and secret key isolation.
  - Provide environment variable template (`.env.example`) and Vercel deployment documentation.
- **Deliverables**: Fully tested, production-ready build and deployment verification summary.

---

## Environment Variables Requirement

| Variable Name | Description | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Secret) | Server Only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key | Client & Server |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key | Server Only |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | Server Only |
| `NEXT_PUBLIC_APP_URL` | Base Application URL | Client & Server |
