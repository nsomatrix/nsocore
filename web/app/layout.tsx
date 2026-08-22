import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'mtx-api — Live Player Inspector & REST Portal',
  description: 'Real-time player inspector and REST API synchronization portal for Ninja School Online.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
