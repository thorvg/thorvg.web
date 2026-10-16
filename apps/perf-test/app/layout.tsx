import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = 'https://thorvg-perf-test.vercel.app';
const TITLE = 'ThorVG Web - Performance Test';
const DESCRIPTION = 'ThorVG WebCanvas performance tester for SW / WebGL / WebGPU renderers';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: TITLE }
    ],
    siteName: TITLE,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
