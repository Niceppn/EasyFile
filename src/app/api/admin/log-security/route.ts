import { NextResponse } from 'next/server';
import { recordSecurityLog } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, country, path, method, userAgent } = body;

    const log = recordSecurityLog(
      ip || '127.0.0.1',
      country || 'TH',
      path || '/',
      method || 'GET',
      userAgent || 'Unknown'
    );

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
