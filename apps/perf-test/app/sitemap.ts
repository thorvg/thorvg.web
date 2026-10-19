import type { MetadataRoute } from 'next';
import pkg from '../package.json';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: pkg.homepage,
    },
  ];
}
