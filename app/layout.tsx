export const dynamic = 'force-dynamic';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import { MetaPixelScript } from '@/components/meta-pixel-script';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://neighborcoverage.com'),
  title: 'NeighborCoverage - Expert Advice, Neighborly Service | Compare Auto Insurance Rates',
  description: 'Your neighbor in protection. Connect with a licensed advisor at NeighborCoverage and discover auto insurance coverage that fits your needs and budget. Expert advice, neighborly service. Call now!',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'NeighborCoverage - Expert Advice, Neighborly Service',
    description: 'Coverage you can trust, right next door. Connect with a licensed advisor and get personalized auto insurance quotes in minutes.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
        <MetaPixelScript />
      </head>
      <body className={`${inter.variable} font-sans bg-[#F9FAFB] text-[#374151] antialiased`}>
        {children}
        <Toaster />
        <ChunkLoadErrorHandler />
      </body>
    </html>
  );
}
