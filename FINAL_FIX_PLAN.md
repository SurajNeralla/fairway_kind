# FairwayKind — Final Remediation & Fix Plan

**Standard**: Digital Heroes PRD & Architecture Requirements  
**Target Brand**: FairwayKind  
**Severity Ranking**: CRITICAL $\rightarrow$ HIGH $\rightarrow$ MEDIUM $\rightarrow$ LOW

---

## 1. CRITICAL ISSUES (Must be resolved immediately)

### Fix 1.1: Eliminate Privilege Escalation Vulnerability on Public Signup
- **Severity**: CRITICAL
- **Component / File**: `src/app/signup/page.tsx`
- **Root Cause**: The signup form provides a role selection dropdown allowing any anonymous visitor to pick `"Platform Administrator (Admin)"`, passing `role: 'admin'` in user metadata and writing an admin role to `profiles`.
- **Remediation**:
  1. Remove the `<Select label="Account Role Type" ... />` component from `src/app/signup/page.tsx`.
  2. Hardcode the registration role strictly to `'user'` in both `supabase.auth.signUp` metadata and the profile upsert fallback.
  3. Ensure admin role assignment is restricted to database seeding or existing admin management.

### Fix 1.2: Resolve 405 Method Not Allowed on Golf Score Editing
- **Severity**: CRITICAL
- **Component / File**: `src/app/api/scores/route.ts`
- **Root Cause**: `src/app/dashboard/scores/page.tsx` sends an HTTP `PATCH` request when updating a score, but `src/app/api/scores/route.ts` only exports `PUT`, returning `405 Method Not Allowed`.
- **Remediation**:
  1. In `src/app/api/scores/route.ts`, export `PATCH = PUT` so both HTTP verbs are accepted.
  2. Verify that score editing passes validation (1–45 range, non-duplicate date) and updates correctly.

---

## 2. HIGH ISSUES (Essential for PRD functional compliance)

### Fix 2.1: Wire Admin Draw Studio to Live Simulation & Publishing APIs
- **Severity**: HIGH
- **Component / File**: `src/app/admin/page.tsx`
- **Root Cause**: The Draw Management studio in `src/app/admin/page.tsx` uses a mock `setTimeout` with golf stroke vectors (`['-1', 'E', '+1', '-2', 'E']`) instead of calling the fully implemented `/api/draws/simulate` and `/api/draws/publish` endpoints. Stableford draws require 5 unique numbers in 1..45.
- **Remediation**:
  1. Update `handleRunSimulation` in `src/app/admin/page.tsx` to invoke `POST /api/draws/simulate` with `periodMonth`, `periodYear`, and `mode`.
  2. Display the actual 5 winning numbers (1–45) and calculated prize tier distributions ($40\%$ Tier 5 + rollover, $35\%$ Tier 4, $25\%$ Tier 3).
  3. Update `handlePublishResults` to invoke `POST /api/draws/publish` to commit the draw to the database and generate official winner records.

### Fix 2.2: Hydrate Subscriber Dashboard with Live Summary Data & Real Score Submission
- **Severity**: HIGH
- **Component / File**: `src/app/dashboard/page.tsx`
- **Root Cause**: The user dashboard renders static `INITIAL_SCORES` and dummy member data instead of hydrating from `GET /api/dashboard/summary`. In addition, the inline score entry form only appends to local React state rather than calling `POST /api/scores`.
- **Remediation**:
  1. Fetch `/api/dashboard/summary` upon component mounting in `src/app/dashboard/page.tsx`.
  2. Populate actual golfer active 5 scores, chosen charity partner, voluntary contribution %, and subscription status.
  3. Wire the score submission forms to call `POST /api/scores`, validate response, and re-fetch dashboard summary.

### Fix 2.3: Connect Admin Sidebar Navigation to Dedicated Sub-Portals
- **Severity**: HIGH
- **Component / File**: `src/app/admin/page.tsx`
- **Root Cause**: Sidebar buttons for "Winners & Payouts" and "Charities" switch local tab state but do not route to the dedicated management pages (`/admin/winners`, `/admin/charities`).
- **Remediation**:
  1. Update sidebar links in `src/app/admin/page.tsx` so "Winners & Payouts" links directly to `/admin/winners` and "Charities" links to `/admin/charities`.

---

## 3. MEDIUM ISSUES (Quality & Integrity)

### Fix 3.1: Complete Residual Brand String Scrubbing
- **Severity**: MEDIUM
- **Component / Files**:
  - `src/lib/stripe/client.ts`: Change `name: 'Digital Heroes Platform'` to `'FairwayKind Platform'`.
  - `src/app/signup/page.tsx`: Change `'Welcome to Digital Heroes.'` to `'Welcome to FairwayKind.'`.
  - `src/lib/auth/auth-context.tsx`: Change fallback name `'Golfer Hero'` to `'Fairway Golfer'`.
  - `package.json`: Change package name to `"fairway-kind"`.
  - `test/run-all.ts`: Update console header to `'FAIRWAYKIND — COMPLETE TEST SUITE RUNNER'`.

### Fix 3.2: Stripe Webhook Service Role Key Reliability Guard
- **Severity**: MEDIUM
- **Component / File**: `src/app/api/webhooks/stripe/route.ts`
- **Root Cause**: Falling back to `anonKey` if `SUPABASE_SERVICE_ROLE_KEY` is missing could cause silent RLS rejections.
- **Remediation**: Ensure an explicit error is returned if `SUPABASE_SERVICE_ROLE_KEY` is not present in server environment.

---

## 4. LOW ISSUES (Optimization & Polish)

### Fix 4.1: Resolve React Hook ESLint Warnings
- **Severity**: LOW
- **Component / Files**:
  - `src/app/admin/winners/page.tsx`: Include or safely wrap `fetchWinners` in `useCallback`.
  - `src/app/dashboard/subscription/page.tsx`: Include or safely wrap `fetchData` in `useCallback`.
  - `src/lib/auth/auth-context.tsx`: Wrap profile fetch dependencies appropriately.

---

## Execution Checklist

- [ ] Execute Fix 1.1 (Remove public signup admin privilege escalation)
- [ ] Execute Fix 1.2 (Add PATCH export to `/api/scores/route.ts`)
- [ ] Execute Fix 2.1 (Wire Admin Draw Management to `/api/draws/simulate` & `/api/draws/publish`)
- [ ] Execute Fix 2.2 (Hydrate User Dashboard from `/api/dashboard/summary` & wire `POST /api/scores`)
- [ ] Execute Fix 2.3 (Link Admin sidebar to `/admin/winners` and `/admin/charities`)
- [ ] Execute Fix 3.1 (Scrub all remaining legacy brand strings)
- [ ] Run `npx tsc --noEmit` (TypeScript validation)
- [ ] Run `npm run lint` (ESLint validation)
- [ ] Run `npm test` (Unit and integration tests)
- [ ] Run `npm run build` (Next.js production build)
- [ ] Deploy to Vercel production
