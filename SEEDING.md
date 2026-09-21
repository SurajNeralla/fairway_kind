# Digital Heroes — Development & Admin Seeding Guide

This guide documents how to create, test, and seed admin and subscriber accounts for development and production testing.

---

## 1. Quick In-App Role Selection (Development Mode)
During registration on the `/signup` page, you can select:
- **Golfer Subscriber (User)** $\rightarrow$ Creates profile with `role = 'user'`.
- **Platform Administrator (Admin)** $\rightarrow$ Creates profile with `role = 'admin'`.

Users registered with `role = 'user'` will be blocked from accessing `/admin/*` routes server-side and redirected to `/unauthorized`. Users registered with `role = 'admin'` will have full access to `/admin/*`.

---

## 2. Promoting Existing User to Admin via SQL
To promote any existing registered user to an `admin` role in Supabase Studio SQL Editor:

```sql
-- Run in Supabase SQL Editor:
SELECT promote_to_admin('your-email@example.com');
```

Alternatively:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 3. Recommended Test Accounts
- **Subscriber Test Account**: `subscriber@digitalheroes.com` / `Password123!` (Role: `user`)
- **Admin Test Account**: `admin@digitalheroes.com` / `Password123!` (Role: `admin`)
