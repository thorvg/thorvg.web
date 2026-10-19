import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/metadata';
import { getExampleById, showcaseExamples } from '@/lib/examples';
import ShowcasePageClient from './ShowcasePageClient';

interface ShowcasePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return showcaseExamples.map((example) => ({
    id: example.id,
  }));
}

export async function generateMetadata({ params }: ShowcasePageProps): Promise<Metadata> {
  const { id } = await params;
  const example = getExampleById(id);

  if (!example) {
    notFound();
  }

  return buildPageMetadata({
    title: `${example.title} | ThorVG Playground`,
    description: example.description,
    url: `/showcase/${example.id}`,
    image: example?.thumbnail,
  });
}

export default async function ShowcasePage({ params }: ShowcasePageProps) {
  const { id } = await params;
  return <ShowcasePageClient id={id} />;
}
