import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const urlPath = request.nextUrl.pathname;

  // EXCLUDE internal system APIs, admin portal, and static assets from triggering security log loop!
  if (
    urlPath.startsWith('/_next') ||
    urlPath.startsWith('/api/admin') ||
    urlPath.startsWith('/api/analytics') ||
    urlPath.startsWith('/easy-admin-portal') ||
    urlPath.startsWith('/favicon') ||
    urlPath.startsWith('/logo') ||
    urlPath.endsWith('.png') ||
    urlPath.endsWith('.jpg') ||
    urlPath.endsWith('.ico') ||
    urlPath.endsWith('.mjs')
  ) {
    return NextResponse.next();
  }

  // Extract IP Address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  let ip = cfIp || realIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1');

  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  // Extract Country Code
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

  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const method = request.method;

  // Asynchronously trigger internal security logger API (silent)
  const origin = request.nextUrl.origin;
  fetch(`${origin}/api/admin/log-security`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ip,
      country,
      path: urlPath,
      method,
      userAgent,
    }),
  }).catch(() => {});

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
