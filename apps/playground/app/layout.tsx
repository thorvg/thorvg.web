import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = 'https://thorvg-playground.vercel.app';
const TITLE = 'ThorVG Playground';
const DESCRIPTION = 'Interactive playground for ThorVG WebCanvas examples';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: TITLE,
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
