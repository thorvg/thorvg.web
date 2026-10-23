import type { MetadataRoute } from 'next';
import { showcaseExamples } from '@/lib/examples';
import packageJson from '@/package.json';

const SITE_URL = packageJson.homepage.replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
    },
    ...showcaseExamples.map((example) => ({
      url: `${SITE_URL}/showcase/${example.id}`,
    }))
  ];
}