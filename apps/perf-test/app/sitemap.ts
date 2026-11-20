import type { MetadataRoute } from 'next';
import packageJson from '../package.json';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: packageJson.homepage,
    },
  ];
}