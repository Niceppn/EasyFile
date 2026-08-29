import { NextResponse } from 'next/server';
import { recordAnalyticsEvent, AnalyticsEvent } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, status = 'success', details } = body;

    // Detect visitor country from HTTP Headers
    const cfCountry = request.headers.get('cf-ipcountry');
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    const acceptLanguage = request.headers.get('accept-language') || '';

    let country = cfCountry || vercelCountry || '';

    if (!country) {
      const lang = acceptLanguage.toLowerCase();
      if (lang.includes('th')) country = 'TH';
      else if (lang.includes('ja')) country = 'JP';
      else if (lang.includes('fr')) country = 'FR';
      else if (lang.includes('de')) country = 'DE';
      else if (lang.includes('es')) country = 'ES';
      else if (lang.includes('zh')) country = 'CN';
      else if (lang.includes('en')) country = 'US';
      else country = 'TH';
    }

    const event = recordAnalyticsEvent(
      type as AnalyticsEvent['type'],
      status as AnalyticsEvent['status'],
      country,
      details
    );

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Analytics Track Error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
