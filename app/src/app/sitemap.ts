import { MetadataRoute } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { Destination } from '@/types';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://krool.github.io/TravelAgentZero';

  // Load destinations for dynamic routes
  const filePath = path.join(process.cwd(), 'public', 'data', 'destinations.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const destinations: Destination[] = JSON.parse(fileContents);

  const destinationEntries: MetadataRoute.Sitemap = destinations.map((dest) => ({
    url: `${baseUrl}/destination/${dest.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/travelers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...destinationEntries,
  ];
}
