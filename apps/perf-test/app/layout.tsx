import { Inter } from 'next/font/google';
import { buildPageMetadata } from '../lib/metadata';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const generateMetadata = () => buildPageMetadata({
  title: 'ThorVG Performance Test',
  description: 'ThorVG WebCanvas performance tester',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
