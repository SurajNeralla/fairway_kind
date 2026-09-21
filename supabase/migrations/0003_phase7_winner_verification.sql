-- Migration: 0003_phase7_winner_verification.sql
-- Description: Phase 7 — Winner Verification & Payout
-- Adds RLS policies for admin access, payouts table, audit logs, and storage bucket policy.

-- ─── Additional RLS Policies ───────────────────────────────────────────────

-- Admin policies: Allow admins to read all data across critical tables
-- Admins need full read access to winners
CREATE POLICY "Admins read all winners"
  ON winners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update winner records (approve/reject proof, mark payout)
CREATE POLICY "Admins update winner records"
  ON winners FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can read all winner proofs
CREATE POLICY "Admins read all winner_proofs"
  ON winner_proofs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update winner_proofs (review details)
CREATE POLICY "Admins update winner_proofs"
  ON winner_proofs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on payouts and audit_logs
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Payouts: Users can view their own payout records
CREATE POLICY "Users read own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = user_id);

-- Payouts: Admins can read and insert all payouts
CREATE POLICY "Admins read all payouts"
  ON payouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins insert payouts"
  ON payouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit Logs: Admins can read all audit logs
CREATE POLICY "Admins read audit_logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit Logs: Any authenticated user can insert (server-side only via service role in practice)
CREATE POLICY "Authenticated users insert audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Draws: Admins can insert, update, delete draws
CREATE POLICY "Admins full access draws"
  ON draws FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Draw entries: Admins can read all draw entries
CREATE POLICY "Admins read all draw_entries"
  ON draw_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Draw entries: Allow server to insert (admins)
CREATE POLICY "Admins insert draw_entries"
  ON draw_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Winners: Allow server to insert winner records (admins via publish)
CREATE POLICY "Admins insert winner records"
  ON winners FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── Supabase Storage Bucket Policy Notes ────────────────────────────────
-- Run these commands in Supabase Dashboard > Storage > winner-proofs bucket:
--
-- 1. Create a private bucket named: winner-proofs
--    (Private = no public URL access)
--
-- 2. Storage RLS Policies for winner-proofs bucket:
--
-- Users can upload their own proofs (INSERT):
-- bucket_id = 'winner-proofs'
-- (storage.foldername(name))[1] = auth.uid()::text
--
-- Users can read their own proofs (SELECT):
-- bucket_id = 'winner-proofs'
-- (storage.foldername(name))[1] = auth.uid()::text
--
-- Admins can read all proofs (SELECT):
-- bucket_id = 'winner-proofs'
-- EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
--
-- ─── Function: Update winner updated_at timestamp ──────────────────────────
CREATE OR REPLACE FUNCTION update_winner_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_winner_timestamp ON winners;
CREATE TRIGGER trigger_update_winner_timestamp
  BEFORE UPDATE ON winners
  FOR EACH ROW
  EXECUTE FUNCTION update_winner_timestamp();

-- ─── Function: Prevent rejected winner from being accidentally marked paid ──
-- This is a double-safety guard at the DB level (app-level guard is in winner-engine.ts)
CREATE OR REPLACE FUNCTION prevent_unauthorized_payout()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow payout_status to be set to 'paid' if proof_status is 'approved'
  IF NEW.payout_status = 'paid' AND NEW.proof_status != 'approved' THEN
    RAISE EXCEPTION 'PAYOUT BLOCKED: Winner proof_status must be ''approved'' before marking payout as paid. Current status: %', NEW.proof_status;
  END IF;

  -- Prevent payout reversal: once paid, cannot be changed to unpaid/pending
  IF OLD.payout_status = 'paid' AND NEW.payout_status != 'paid' THEN
    RAISE EXCEPTION 'PAYOUT REVERSAL BLOCKED: Cannot change payout_status from ''paid'' to ''%''', NEW.payout_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_unauthorized_payout ON winners;
CREATE TRIGGER trigger_prevent_unauthorized_payout
  BEFORE UPDATE ON winners
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_payout();
