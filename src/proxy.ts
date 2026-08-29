import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { recordSecurityLog } from './lib/db';

export function proxy(request: NextRequest) {
  const urlPath = request.nextUrl.pathname;

  // EXCLUDE internal system APIs, admin portal, sitemaps, robots, and static assets
  if (
    urlPath.startsWith('/_next') ||
    urlPath.startsWith('/api/admin') ||
    urlPath.startsWith('/api/analytics') ||
    urlPath.startsWith('/easy-admin-portal') ||
    urlPath.includes('sitemap') ||
    urlPath.includes('robots') ||
    urlPath.startsWith('/favicon') ||
    urlPath.startsWith('/logo') ||
    urlPath.endsWith('.png') ||
    urlPath.endsWith('.jpg') ||
    urlPath.endsWith('.ico') ||
    urlPath.endsWith('.xml') ||
    urlPath.endsWith('.txt') ||
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

  // Record security log directly in memory/DB without any HTTP fetch loop!
  try {
    recordSecurityLog(ip, country, urlPath, method, userAgent);
  } catch (err) {
    // Silent catch
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
