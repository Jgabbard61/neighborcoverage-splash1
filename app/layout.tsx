export const dynamic = 'force-dynamic';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://neighborcoverage.com'),
  title: 'NeighborCoverage - One Neighbor, Total Coverage | Insurance & Home Services',
  description: 'Your coverage umbrella. NeighborCoverage connects you with licensed advisors and vetted pros across auto, home, Medicare, and final expense insurance plus plumbing, roofing, HVAC, pest control, bathroom remodels, and window installs. Expert advice, neighborly service. Call now!',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'NeighborCoverage - One Neighbor, Total Coverage',
    description: 'Coverage you can trust, right next door. Insurance and home services under one trusted umbrella — get connected with licensed advisors and vetted pros in minutes.',
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
fbq('init', '2466716013819414');
fbq('track', 'PageView');

// Helper: generate UUID
function ncGenUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper: read a cookie by name
function ncGetCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

// Capture fbclid from URL and store in _fbc cookie if not already set
(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid');
    if (fbclid && !ncGetCookie('_fbc')) {
      var fbc = 'fb.1.' + Date.now() + '.' + fbclid;
      document.cookie = '_fbc=' + encodeURIComponent(fbc) + '; path=/; max-age=7776000; SameSite=Lax';
    }
  } catch(e) {}
})();

// Track InitiateCall on tel: link clicks — with per-session deduplication
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href^="tel:"]');
  if (!link || typeof fbq !== 'function') return;

  var telHref = link.getAttribute('href') || 'tel:unknown';
  var sessionKey = 'nc_call_fired_' + telHref.replace(/[^0-9]/g, '');
  var ctaLocation = link.getAttribute('data-cta-location') || 'unknown';

  // Dedup: if we already fired for this number this session, skip
  if (sessionStorage.getItem(sessionKey)) return;

  // Generate a unique eventId for dedup across browser + CAPI
  var eventId = ncGenUUID();
  sessionStorage.setItem(sessionKey, eventId);

  // Fire browser-side pixel events with eventID for dedup
  fbq('track', 'Contact', { eventID: eventId });
  fbq('trackCustom', 'InitiateCall', {
    cta_location: ctaLocation,
    eventID: eventId,
    timestamp: new Date().toISOString()
  });

  // Also fire server-side CAPI via our Next.js API route (for dedup + better signal)
  try {
    fetch('/api/meta-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'InitiateCall',
        eventId: eventId,
        ctaLocation: ctaLocation,
        sourceUrl: window.location.href,
        userAgent: navigator.userAgent,
        fbc: ncGetCookie('_fbc'),
        fbp: ncGetCookie('_fbp')
      }),
      keepalive: true
    });
  } catch(ex) {}
}, true);
`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2466716013819414&ev=PageView&noscript=1"
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
