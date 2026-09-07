import type { Metadata } from 'next';
import { AppHeader } from '@/layouts/AppHeader';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Studio Ops — Data Table',
  description: 'A reusable, headless-first data table rendering a fitness studio dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
