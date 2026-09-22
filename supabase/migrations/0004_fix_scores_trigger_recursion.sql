-- Migration: 0004_fix_scores_trigger_recursion.sql
-- Description: Fix infinite recursion in maintain_top_5_scores trigger by guarding with pg_trigger_depth()

CREATE OR REPLACE FUNCTION public.maintain_top_5_scores()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Prevent infinite recursion when update triggers itself
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
