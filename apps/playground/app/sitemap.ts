import type { MetadataRoute } from 'next';
import { showcaseExamples } from '@/lib/examples';

const SITE_URL = "https://thorvg-playground.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      priority: 1,
    },
    ...showcaseExamples.map((example) => ({
      url: `${SITE_URL}/showcase/${example.id}`,
      priority: 0.8,
    }))
  ];
}