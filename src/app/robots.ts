import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/easy-admin-portal-998/', '/api/'],
    },
    sitemap: 'https://easyfile.click/sitemap.xml',
  };
}
