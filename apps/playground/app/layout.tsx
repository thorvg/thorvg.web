import { buildPageMetadata } from "@/lib/metadata";
import "./globals.css";

export const generateMetadata = () => buildPageMetadata({
  title: 'ThorVG Playground',
  description: 'Interactive playground for ThorVG',
  url: '/',
});

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
