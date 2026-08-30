import fs from 'fs';
import path from 'path';

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'compress_pdf' | 'pdf_to_image' | 'qr_generate';
  status: 'success' | 'error';
  country: string;
  details?: string;
  timestamp: string;
}

export interface AdInquiryRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

export interface SecurityLogRecord {
  id: string;
  ip: string;
  country: string;
  path: string;
  method: string;
  userAgent: string;
  threatLevel: 'NORMAL' | 'HIGH_FREQUENCY' | 'SUSPECTED_ATTACK';
  timestamp: string;
}

interface DatabaseSchema {
  events: AnalyticsEvent[];
  inquiries: AdInquiryRecord[];
  securityLogs: SecurityLogRecord[];
}

const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDbExists(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = { events: [], inquiries: [], securityLogs: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.securityLogs) parsed.securityLogs = [];
    return parsed;
  } catch (err) {
    console.error('Database File Read/Write Error:', err);
    return { events: [], inquiries: [], securityLogs: [] };
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database Save Error:', err);
  }
}

export function recordAnalyticsEvent(
  type: AnalyticsEvent['type'],
  status: AnalyticsEvent['status'],
  country: string,
  details?: string
): AnalyticsEvent {
  const db = ensureDbExists();
  const event: AnalyticsEvent = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    type,
    status,
    country: country.toUpperCase(),
    details,
    timestamp: new Date().toISOString(),
  };

  db.events.push(event);
  if (db.events.length > 10000) {
    db.events = db.events.slice(-10000);
  }

  saveDb(db);
  return event;
}

export function recordAdInquiry(
  name: string,
  company: string,
  email: string,
  phone: string,
  message: string
): AdInquiryRecord {
  const db = ensureDbExists();
  const inquiry: AdInquiryRecord = {
    id: 'inq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name,
    company,
    email,
    phone,
    message,
    timestamp: new Date().toISOString(),
  };

  db.inquiries.push(inquiry);
  saveDb(db);
  return inquiry;
}

export function recordSecurityLog(
  ip: string,
  country: string,
  pathName: string,
  method: string,
  userAgent: string
): SecurityLogRecord {
  const db = ensureDbExists();
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();

  // Rate check: count requests from same IP in the last 1 minute
  const recentIpRequests = db.securityLogs.filter(
    (l) => l.ip === ip && l.timestamp >= oneMinuteAgo
  ).length;

  let threatLevel: SecurityLogRecord['threatLevel'] = 'NORMAL';
  if (recentIpRequests > 25) {
    threatLevel = 'SUSPECTED_ATTACK';
  } else if (recentIpRequests > 10) {
    threatLevel = 'HIGH_FREQUENCY';
  }

  // Detect malicious bot scanners targeting wp-admin, phpmyadmin, .env, etc.
  const maliciousPaths = ['wp-admin', 'wp-login', 'phpmyadmin', '.env', 'eval', 'xmlrpc', 'shell'];
  if (maliciousPaths.some((m) => pathName.toLowerCase().includes(m))) {
    threatLevel = 'SUSPECTED_ATTACK';
  }

  const log: SecurityLogRecord = {
    id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    ip: ip || '127.0.0.1',
    country: country.toUpperCase(),
    path: pathName,
    method,
    userAgent: userAgent || 'Unknown',
    threatLevel,
    timestamp: now.toISOString(),
  };

  db.securityLogs.push(log);
  if (db.securityLogs.length > 5000) {
    db.securityLogs = db.securityLogs.slice(-5000);
  }

  saveDb(db);
  return log;
}

export function getStatsSummary() {
  const db = ensureDbExists();
  const events = db.events;
  const securityLogs = db.securityLogs || [];

  const totalEvents = events.length;
  const pageViews = events.filter((e) => e.type === 'page_view').length;
  const compressPdfEvents = events.filter((e) => e.type === 'compress_pdf');
  const pdfToImageEvents = events.filter((e) => e.type === 'pdf_to_image');
  const qrGenerateEvents = events.filter((e) => e.type === 'qr_generate');

  const compressPdfSuccess = compressPdfEvents.filter((e) => e.status === 'success').length;
  const pdfToImageSuccess = pdfToImageEvents.filter((e) => e.status === 'success').length;
  const qrGenerateSuccess = qrGenerateEvents.filter((e) => e.status === 'success').length;

  // Country Breakdown
  const countryCounts: Record<string, number> = {};
  events.forEach((e) => {
    const c = e.country || 'TH';
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });

  const countryBreakdown = Object.entries(countryCounts)
    .map(([country, count]) => ({
      country,
      count,
      percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Security Attack Metrics
  const suspectedAttacks = securityLogs.filter((l) => l.threatLevel === 'SUSPECTED_ATTACK').length;
  const highFrequencyLogs = securityLogs.filter((l) => l.threatLevel === 'HIGH_FREQUENCY').length;

  // Recent Generated QR Code Links
  const recentQrEvents = qrGenerateEvents.slice(-50).reverse().map((e) => ({
    id: e.id,
    url: e.details || 'https://qubezip.online',
    country: e.country,
    timestamp: e.timestamp,
  }));

  // Recent PDF Compression Events
  const recentCompressEvents = compressPdfEvents.slice(-50).reverse().map((e) => {
    let parsed: any = {};
    try {
      if (e.details) parsed = JSON.parse(e.details);
    } catch (err) {}
    return {
      id: e.id,
      fileName: parsed.fileName || 'document.pdf',
      originalSize: parsed.originalSizeFormatted || '1.0 MB',
      compressedSize: parsed.compressedSizeFormatted || '500 KB',
      savedPercent: parsed.savedPercent !== undefined ? parsed.savedPercent : 50,
      country: e.country,
      status: e.status,
      timestamp: e.timestamp,
    };
  });

  // Recent PDF to Image Events
  const recentPdfToImageEvents = pdfToImageEvents.slice(-50).reverse().map((e) => {
    let parsed: any = {};
    try {
      if (e.details) parsed = JSON.parse(e.details);
    } catch (err) {}
    return {
      id: e.id,
      fileName: parsed.fileName || 'document.pdf',
      pageCount: parsed.pageCount || 1,
      format: parsed.format || 'JPEG',
      country: e.country,
      status: e.status,
      timestamp: e.timestamp,
    };
  });

  // Top Targeted Paths
  const pathCounts: Record<string, number> = {};
  securityLogs.forEach((l) => {
    pathCounts[l.path] = (pathCounts[l.path] || 0) + 1;
  });

  const topTargetedPaths = Object.entries(pathCounts)
    .map(([pathName, count]) => ({ path: pathName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEvents,
    pageViews,
    compressPdf: {
      total: compressPdfEvents.length,
      success: compressPdfSuccess,
      failed: compressPdfEvents.length - compressPdfSuccess,
      successRate: compressPdfEvents.length > 0 ? Math.round((compressPdfSuccess / compressPdfEvents.length) * 100) : 100,
    },
    pdfToImage: {
      total: pdfToImageEvents.length,
      success: pdfToImageSuccess,
      failed: pdfToImageEvents.length - pdfToImageSuccess,
      successRate: pdfToImageEvents.length > 0 ? Math.round((pdfToImageSuccess / pdfToImageEvents.length) * 100) : 100,
    },
    qrGenerate: {
      total: qrGenerateEvents.length,
      success: qrGenerateSuccess,
      failed: qrGenerateEvents.length - qrGenerateSuccess,
      successRate: qrGenerateEvents.length > 0 ? Math.round((qrGenerateSuccess / qrGenerateEvents.length) * 100) : 100,
    },
    countryBreakdown,
    recentQrEvents,
    recentCompressEvents,
    recentPdfToImageEvents,
    inquiries: db.inquiries.reverse(),
    security: {
      totalLogs: securityLogs.length,
      suspectedAttacks,
      highFrequencyLogs,
      topTargetedPaths,
      recentLogs: securityLogs.slice(-100).reverse(),
    },
  };
}
