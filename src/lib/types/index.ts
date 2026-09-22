export type UserRole = 'user' | 'admin';
export type PlanType = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
export type DrawStatus = 'draft' | 'simulated' | 'published' | 'completed';
export type DrawMode = 'random' | 'algorithmic';
export type PrizeTier = 'tier_5_match' | 'tier_4_match' | 'tier_3_match' | 'none';
export type ProofStatus = 'pending_submission' | 'submitted' | 'approved' | 'rejected';
export type PayoutStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  ein?: string;
  website_url?: string;
  total_raised: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id?: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  charity_id?: string;
  voluntary_charity_percent: number;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number; // 1-45
  played_on: string; // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
}

export interface Draw {
  id: string;
  title: string;
  period_month: number;
  period_year: number;
  draw_date: string;
  status: DrawStatus;
  mode: DrawMode;
  winning_numbers?: number[];
  total_prize_pool: number;
  tier_5_pool: number;
  tier_4_pool: number;
  tier_3_pool: number;
  rollover_amount: number;
  created_at: string;
  updated_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  entry_numbers: number[];
  score_ids: string[];
  match_count: number;
  prize_tier: PrizeTier;
  prize_amount: number;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  draw_entry_id: string;
  user_id: string;
  match_count: number;
  prize_tier: PrizeTier;
  prize_amount: number;
  proof_status: ProofStatus;
  payout_status: PayoutStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WinnerProof {
  id: string;
  winner_id: string;
  user_id: string;
  proof_file_url: string;
  file_name: string;
  file_size_bytes?: number;
  status: ProofStatus;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}
