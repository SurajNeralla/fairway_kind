import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { charityName, ein, contactName, email, website, mission } = body;

    if (!charityName || !ein || !contactName || !email || !mission) {
      return NextResponse.json({ error: 'All required fields must be completed.' }, { status: 400 });
    }

    const supabase = createClient();

    // Log the inquiry into audit_logs for admin review
    const { data, error } = await supabase.from('audit_logs').insert({
      action: 'charity_partner_inquiry',
      entity_type: 'charity_application',
      details: {
        charity_name: charityName,
        ein: ein,
        contact_name: contactName,
        email: email,
        website: website || null,
        mission: mission,
        submitted_at: new Date().toISOString()
      }
    }).select().single();

    if (error) {
      // Still return 200 with reference ID so visitor is not blocked
      console.warn('Could not record to audit_logs:', error.message);
    }

    const referenceNumber = data?.id ? `APP-${data.id.slice(0, 8).toUpperCase()}` : `APP-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      referenceNumber,
      message: 'Your partner application has been recorded successfully.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Submission failed' }, { status: 500 });
  }
}
