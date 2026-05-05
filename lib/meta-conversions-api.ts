// Server-side Meta Conversions API helper

const META_API_VERSION = 'v21.0';

interface ConversionEventData {
  eventName: string;
  eventId: string;
  eventTime?: number;
  sourceUrl?: string;
  userAgent?: string;
  clientIpAddress?: string;
  fbc?: string;
  fbp?: string;
  customData?: Record<string, any>;
}

export async function sendConversionEvent(data: ConversionEventData): Promise<{ success: boolean; response?: any; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSION_API_TOKEN;

  if (!pixelId || pixelId === 'YOUR_META_PIXEL_ID' || !accessToken || accessToken === 'YOUR_META_CONVERSION_API_TOKEN') {
    console.log('[Meta CAPI] Skipped — missing or placeholder credentials. Event:', data?.eventName, 'ID:', data?.eventId);
    return { success: true, response: { skipped: true, reason: 'Missing credentials' } };
  }

  const eventPayload = {
    data: [
      {
        event_name: data?.eventName ?? 'Unknown',
        event_time: data?.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: data?.eventId ?? '',
        event_source_url: data?.sourceUrl ?? '',
        action_source: 'website',
        user_data: {
          client_ip_address: data?.clientIpAddress ?? '',
          client_user_agent: data?.userAgent ?? '',
          fbc: data?.fbc ?? '',
          fbp: data?.fbp ?? '',
        },
        custom_data: data?.customData ?? {},
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    const result = await response?.json?.().catch(() => ({}));
    
    if (!response?.ok) {
      console.error('[Meta CAPI] Error:', response?.status, result);
      return { success: false, error: `HTTP ${response?.status}`, response: result };
    }

    console.log('[Meta CAPI] Success:', data?.eventName, 'ID:', data?.eventId);
    return { success: true, response: result };
  } catch (err: any) {
    console.error('[Meta CAPI] Network error:', err?.message ?? err);
    return { success: false, error: err?.message ?? 'Network error' };
  }
}
