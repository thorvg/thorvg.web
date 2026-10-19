import type { Metadata } from 'next';
import pkg from '../package.json';

interface MetadataOptions {
  title: string,
  description: string,
  url?: string
}

export function buildPageMetadata(
  { title, description, url = '/' }: MetadataOptions
): Metadata {
  return {
    metadataBase: pkg.homepage,
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url: url,
      images: [
        {
          url: '/og-image.png',
          width: 1572,
          height: 869,
          alt: title,
        },
      ],
      siteName: 'ThorVG Performance Test',
      type: 'website',
    },
  };
}