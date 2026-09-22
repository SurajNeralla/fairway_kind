import { createBrowserClient } from '@supabase/ssr';
import { APP_CONFIG } from '@/lib/config';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      APP_CONFIG.supabase.url,
      APP_CONFIG.supabase.anonKey
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      APP_CONFIG.supabase.url,
      APP_CONFIG.supabase.anonKey
    );
  }

  return browserClient;
}
