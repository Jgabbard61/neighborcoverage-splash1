import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
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
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* TODO Phase 1B: Add Meta Pixel base code here */}
        {/* INSTRUCTIONS: Once you have your Meta Pixel ID from Facebook Business Manager:
        1. Replace 'YOUR_PIXEL_ID' below with your actual Pixel ID
        2. Uncomment the script block
        3. The pixel will automatically track PageView events
        
        Example Meta Pixel Code:
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
              fbq('init', 'YOUR_PIXEL_ID');
              fbq('track', 'PageView');
            `,
          }}
        />
        */}
        
        {/* Google Analytics 4 - Tracking Code */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YYYQPS9NWX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YYYQPS9NWX', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
