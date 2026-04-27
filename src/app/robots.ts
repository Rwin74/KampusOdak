import { MetadataRoute } from 'next';

const BASE_URL = 'https://kampusodak.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/dashboard', '/profile'],
        disallow: [
          '/api/',
          '/admin/',
          '/dershane/',
          '/room/',
          '/_next/',
          '/fonts/',
        ],
      },
      // AI Crawlers – full access to public pages
      {
        userAgent: 'GPTBot',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/room/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/room/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/room/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/room/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
