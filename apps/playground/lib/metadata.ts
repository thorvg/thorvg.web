import type { Metadata } from 'next';
import pkg from '../package.json';

interface MetadataOptions {
  title: string,
  description: string,
  url?: string
  image?: string
}

export function buildPageMetadata(
  { title, description, url = '/', image = '/og-image.png' }: MetadataOptions
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
          url: image,
          width: 1572,
          height: 869,
          alt: title,
        },
      ],
      siteName: 'ThorVG Playground',
      type: 'website',
    },
  };
}