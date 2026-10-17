import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://thorvg-perf-test.vercel.app',
      priority: 1,
    },
  ];
}