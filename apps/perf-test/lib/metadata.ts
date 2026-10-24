import type { Metadata } from 'next';
import packageJson from '../package.json';

interface MetadataOptions {
  title: string,
  description: string,
  url: string
}

export function buildPageMetadata(
  { title, description, url }: MetadataOptions
): Metadata {
  return {
    metadataBase: packageJson.homepage,
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'ThorVG Performance Test',
      type: 'website',
    },
  };
}