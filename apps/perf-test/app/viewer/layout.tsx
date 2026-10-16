import type { Metadata } from 'next';

const TITLE = 'Animation Viewer | ThorVG';
const DESCRIPTION = 'Inspect Lottie animations and rendering performance.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/viewer',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: TITLE }
    ],
    siteName: 'ThorVG Web - Performance Test',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png']
  }
};

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}