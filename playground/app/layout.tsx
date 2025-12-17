import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThorVG Playground",
  description: "Interactive playground for ThorVG WebCanvas examples",
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
