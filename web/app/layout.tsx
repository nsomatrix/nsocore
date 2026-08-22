import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NSO Matrix — Live Player Inspector & REST Portal',
  description: 'Supabase-styled real-time player inspector and NinjaDex database for Ninja School Online.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-supabase-bg text-supabase-text min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
