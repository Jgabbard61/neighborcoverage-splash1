export const dynamic = 'force-dynamic';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';

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
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1469359514924643');
fbq('track', 'PageView');

// Track InitiateCall on ALL tel: link clicks
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href^="tel:"]');
  if (link && typeof fbq === 'function') {
    fbq('track', 'Contact');
    fbq('trackCustom', 'InitiateCall', {
      cta_location: link.getAttribute('data-cta-location') || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
}, true);
`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1469359514924643&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${inter.variable} font-sans bg-[#F9FAFB] text-[#374151] antialiased`}>
        {children}
        <Toaster />
        <ChunkLoadErrorHandler />
      </body>
    </html>
  );
}
