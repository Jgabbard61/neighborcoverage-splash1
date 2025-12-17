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
        {/* Meta Pixel - Event Tracking */}
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
              
              // Initialize Meta Pixel only once
              if (!window._fbq_initialized) {
                fbq('init', '1884617578809782');
                fbq('track', 'PageView');
                window._fbq_initialized = true;
              }
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1884617578809782&ev=PageView&noscript=1"
          />
        </noscript>
        
        {/* Google Analytics 4 - Tracking Code */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YYYQPS9NWX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Configure GA4 with proper settings
              gtag('config', 'G-YYYQPS9NWX', {
                page_path: window.location.pathname,
                send_page_view: true,
                cookie_flags: 'SameSite=None;Secure'
              });
              
              // Log initialization for debugging
              console.log('GA4 initialized with ID: G-YYYQPS9NWX');
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
