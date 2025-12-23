import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThorVG Playground",
  description: "Interactive playground for ThorVG Canvas Kit examples",
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
