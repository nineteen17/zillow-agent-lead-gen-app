import { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  // Static pages
  sitemap.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  });

  sitemap.push({
    url: `${SITE_URL}/estimate`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  sitemap.push({
    url: `${SITE_URL}/agents`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // Fetch all suburbs
  try {
    const response = await fetch(`${API_BASE}/suburbs`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (response.ok) {
      const data = await response.json();
      const suburbs = data.suburbs || [];

      // Add suburb pages
      suburbs.forEach((suburb: string) => {
        sitemap.push({
          url: `${SITE_URL}/suburb/${encodeURIComponent(suburb)}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching suburbs for sitemap:', error);
  }

  return sitemap;
}
