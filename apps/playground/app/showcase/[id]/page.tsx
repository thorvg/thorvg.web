import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getExampleById, showcaseExamples } from '@/lib/examples';
import ShowcasePageClient from './ShowcasePageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return showcaseExamples.map((example) => ({
    id: example.id,
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const example = getExampleById(id);

  if (!example) {
    notFound();
  }

  const TITLE = `${example.title} | ThorVG Playground`;
  const URL = `/showcase/${example.id}`;

  return {
    title: TITLE,
    description: example.description,
    alternates: {
      canonical: URL,
    },
    openGraph: {
      title: TITLE,
      description: example.description,
      url: URL,
      siteName: 'ThorVG Playground',
      type: 'website',
      images: [
        { url: example.thumbnail || '/og-image.png', width: 1200, height: 630, alt: TITLE }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: example.description,
      images: [ example.thumbnail || '/og-image.png']
    }
  }
}

export default async function ShowcasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShowcasePageClient id={id} />;
}
