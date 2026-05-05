// Client-side Meta Pixel utilities

export function generateEventId(): string {
  return `nc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function trackInitiateCall(ctaLocation: string): string {
  const eventId = generateEventId();
  
  if (typeof window !== 'undefined' && (window as any)?.fbq) {
    try {
      (window as any).fbq('trackCustom', 'InitiateCall', {
        cta_location: ctaLocation,
        phone_number: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '000-000-0000',
        timestamp: new Date().toISOString(),
      }, { eventID: eventId });
    } catch (e: any) {
      console.error('Meta Pixel InitiateCall error:', e?.message ?? e);
    }
  }

  // Also fire server-side for dedup
  sendServerEvent('InitiateCall', eventId, ctaLocation).catch((err: any) => {
    console.error('Server conversion error:', err?.message ?? err);
  });

  return eventId;
}

async function sendServerEvent(eventName: string, eventId: string, ctaLocation: string): Promise<void> {
  try {
    const response = await fetch('/api/meta-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        ctaLocation,
        sourceUrl: typeof window !== 'undefined' ? window?.location?.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator?.userAgent : '',
        fbc: getCookie('_fbc') ?? '',
        fbp: getCookie('_fbp') ?? '',
      }),
    });
    if (!response?.ok) {
      console.error('Server event failed:', response?.status);
    }
  } catch (err: any) {
    console.error('Server event error:', err?.message ?? err);
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document?.cookie?.match?.(new RegExp('(^| )' + name + '=([^;]+)'));
  return match?.[2] ?? null;
}
