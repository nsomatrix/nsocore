import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NSO MATRIX BIOS v2.17 — Live REST API & Telemetry Portal',
  description: 'API-Centric BIOS terminal and real-time J2ME REST API inspector for Ninja School Online.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bios-bg text-bios-green min-h-screen font-mono antialiased selection:bg-bios-green selection:text-black">
        {children}
      </body>
    </html>
  );
}
