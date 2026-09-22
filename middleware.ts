import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { APP_CONFIG } from '@/lib/config';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip auth middleware if Supabase is not configured (e.g. build time without env vars)
  if (!APP_CONFIG.supabase.url || !APP_CONFIG.supabase.anonKey) {
    return response;
  }

  const supabase = createServerClient(
    APP_CONFIG.supabase.url,
    APP_CONFIG.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. Authenticated users attempting to visit /login or /signup
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const isSubscribed = sub?.status === 'active' || sub?.status === 'trialing';
    if (isSubscribed) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/subscribe', request.url));
    }
  }

  // 2. Unauthenticated user trying to access protected dashboard or admin routes
  if (!user && (isDashboardRoute || isAdminRoute)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Server-side Admin Role Verification for /admin/* routes
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // 4. Server-side Subscription Verification for /dashboard/* routes
  if (user && isDashboardRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    // Admins have their own portal at /admin
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Check authoritative database subscription status
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const isSubscribed = sub?.status === 'active' || sub?.status === 'trialing';

    // Allow checkout success return flow to reach confirmation page
    const hasCheckoutSession =
      pathname === '/dashboard/subscription' &&
      (request.nextUrl.searchParams.has('session_id') ||
        request.nextUrl.searchParams.get('status') === 'success');

    if (!isSubscribed && !hasCheckoutSession) {
      // Unsubscribed user is gated from subscriber dashboard
      return NextResponse.redirect(new URL('/subscribe', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
};
