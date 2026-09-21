import { createBrowserClient } from '@supabase/ssr';
import { APP_CONFIG } from '@/lib/config';

export function createClient() {
  return createBrowserClient(
    APP_CONFIG.supabase.url,
    APP_CONFIG.supabase.anonKey
  );
}
