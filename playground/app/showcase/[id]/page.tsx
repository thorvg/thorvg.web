import { showcaseExamples } from '@/lib/examples';
import ShowcasePageClient from './ShowcasePageClient';

export function generateStaticParams() {
  return showcaseExamples.map((example) => ({
    id: example.id,
  }));
}

export default async function ShowcasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShowcasePageClient id={id} />;
}
