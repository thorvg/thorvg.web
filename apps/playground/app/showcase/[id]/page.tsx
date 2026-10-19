import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/metadata';
import { getExampleById, showcaseExamples } from '@/lib/examples';
import ShowcasePageClient from './ShowcasePageClient';

interface ShowcasePageArgs {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return showcaseExamples.map((example) => ({
    id: example.id,
  }));
}

export async function generateMetadata({ params }: ShowcasePageArgs): Promise<Metadata> {
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

export default async function ShowcasePage({ params }: ShowcasePageArgs) {
  const { id } = await params;
  return <ShowcasePageClient id={id} />;
}
