import type { Metadata } from 'next';
import { getExampleById, showcaseExamples } from '@/lib/examples';
import ShowcasePageClient from './ShowcasePageClient';

export function generateStaticParams() {
  return showcaseExamples.map((example) => ({
    id: example.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const example = getExampleById(id);
  if (!example) {
    return { title: 'Example not found' };
  }

  const images = example.thumbnail
    ? [{ url: example.thumbnail, alt: example.title }]
    : [{ url: '/og.png', width: 1200, height: 630, alt: example.title }];

  return {
    title: example.title,
    description: example.description,
    openGraph: {
      type: 'website',
      siteName: 'ThorVG Playground',
      title: example.title,
      description: example.description,
      url: `/showcase/${id}`,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: example.title,
      description: example.description,
      images: images.map((image) => image.url),
    },
  };
}

export default async function ShowcasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShowcasePageClient id={id} />;
}
