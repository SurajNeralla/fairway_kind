import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || APP_CONFIG.supabase.anonKey;
  return createSupabaseClient(
    APP_CONFIG.supabase.url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Creates a Supabase client for API routes that supports both:
 * 1. Cookie-based auth (normal browser sessions)
 * 2. Authorization Bearer token (for programmatic access or when cookies are missing)
 */
export function createClientFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (bearerToken) {
    // Use service role client to validate the JWT and get user
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || APP_CONFIG.supabase.anonKey;
    return createSupabaseClient(APP_CONFIG.supabase.url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    });
  }

  // Fall back to cookie-based auth
  return createClient();
}

/**
 * Resolves the signed-in user for an API request. Supabase's `auth.getUser()`
 * does not read a token supplied only through a client's global headers, so a
 * bearer token must be passed directly when the request originates in the
 * browser client rather than from a server-managed cookie session.
 */
export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (bearerToken) {
    return createAdminClient().auth.getUser(bearerToken);
  }

  return createClient().auth.getUser();
}
