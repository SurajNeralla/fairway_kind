import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, charityId } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Please provide full name, email, and password.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Create user with pre-confirmed email (bypasses Supabase SMTP free tier rate limits)
    const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        role: 'user',
        charity_id: charityId || 'c1000000-0000-0000-0000-000000000001',
      },
    });

    if (createError) {
      const msg = createError.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('unique') || (createError as any).status === 422) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: msg || 'Unable to register account.' },
        { status: 400 }
      );
    }

    const userId = userData.user.id;

    // 2. Explicitly ensure profile is registered
    await adminSupabase.from('profiles').upsert({
      id: userId,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role: 'user',
    }, { onConflict: 'id' });

    // 3. Initialize default subscription record
    await adminSupabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: `cus_new_${userId.substring(0, 8)}`,
      status: 'incomplete',
      plan_type: 'monthly',
      charity_id: charityId || 'c1000000-0000-0000-0000-000000000001',
      voluntary_charity_percent: 10.00,
    }, { onConflict: 'user_id' });

    return NextResponse.json({
      success: true,
      userId,
      email: userData.user.email,
    });
  } catch (err: any) {
    console.error('Server signup error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
