-- Migration: 0002_auth_and_profiles.sql
-- Description: Trigger for automatic profile creation on auth signup and updated RLS policies

-- Function to handle new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Golfer Hero'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comprehensive RLS Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles reading" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Comprehensive RLS Policies for Admin Access across tables
CREATE POLICY "Admins full access to subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to scores" ON public.scores
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to charities" ON public.charities
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to draws" ON public.draws
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to draw_entries" ON public.draw_entries
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to winners" ON public.winners
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to winner_proofs" ON public.winner_proofs
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to payouts" ON public.payouts
  FOR ALL USING (public.is_admin());
