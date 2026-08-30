import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const cfCountry = request.headers.get('cf-ipcountry') || '';
  const vercelCountry = request.headers.get('x-vercel-ip-country') || '';
  const country = (cfCountry || vercelCountry || '').toUpperCase();

  return NextResponse.json({ country });
}
