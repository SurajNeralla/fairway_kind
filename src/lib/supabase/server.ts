import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/lib/config';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    APP_CONFIG.supabase.url,
    APP_CONFIG.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  );
}
