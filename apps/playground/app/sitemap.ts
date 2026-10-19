import type { MetadataRoute } from 'next';
import { showcaseExamples } from '@/lib/examples';
import pkg from '../package.json';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: pkg.homepage,
    },
    ...showcaseExamples.map((example) => ({
      url: new URL(`showcase/${example.id}`, pkg.homepage).href,
    })),
  ];
}
