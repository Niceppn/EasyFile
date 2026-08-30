import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/qube-admin-portal-998/', '/api/'],
    },
    sitemap: 'https://qubezip.online/sitemap.xml',
  };
}
