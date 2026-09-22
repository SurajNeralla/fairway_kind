-- Migration: 0005_security_hardening.sql
-- Description: Enforce strict role isolation, prevent privilege escalation, protect subscription & winner states

-- 1. Function to prevent non-admins from changing their role
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

-- 2. Restrict profiles update policy with explicit WITH CHECK constraint
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    public.is_admin() OR (auth.uid() = id AND role = 'user'::public.user_role)
  );

-- 3. Ensure users cannot directly insert or modify subscriptions table (only read permitted)
DROP POLICY IF EXISTS "Users update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users insert own subscription" ON public.subscriptions;

-- Subscriptions are strictly updated by Stripe webhooks (service role) or Admin operations
-- 4. Ensure winners and payouts are read-only for standard users
DROP POLICY IF EXISTS "Users update own wins" ON public.winners;
DROP POLICY IF EXISTS "Users insert own wins" ON public.winners;
DROP POLICY IF EXISTS "Users update payouts" ON public.payouts;
DROP POLICY IF EXISTS "Users insert payouts" ON public.payouts;
