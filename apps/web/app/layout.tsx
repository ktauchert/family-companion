import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Family Companion',
  description: 'Gemeinsame Haushalts-App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
