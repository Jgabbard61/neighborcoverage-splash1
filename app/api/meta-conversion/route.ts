export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConversionEvent } from '@/lib/meta-conversions-api';

// In-memory dedup fallback
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request?.json?.().catch(() => ({}));
    const {
      eventName = 'InitiateCall',
      eventId = '',
      ctaLocation = '',
      sourceUrl = '',
      userAgent = '',
      fbc = '',
      fbp = '',
    } = body ?? {};

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Check for duplicate - DB or in-memory
    let isDuplicate = false;
    if (prisma) {
      const existing = await prisma.conversionEvent.findUnique({
        where: { eventId },
      }).catch(() => null);
      isDuplicate = !!existing;
    } else {
      isDuplicate = processedEvents.has(eventId);
    }

    if (isDuplicate) {
      return NextResponse.json({ status: 'duplicate', eventId });
    }

    const clientIp = request?.headers?.get?.('x-forwarded-for')?.split(',')?.[0]?.trim?.() ?? 
                     request?.headers?.get?.('x-real-ip') ?? '';

    const result = await sendConversionEvent({
      eventName,
      eventId,
      sourceUrl,
      userAgent,
      clientIpAddress: clientIp,
      fbc,
      fbp,
      customData: { cta_location: ctaLocation },
    });

    // Store in database or in-memory
    if (prisma) {
      await prisma.conversionEvent.create({
        data: {
          eventName,
          eventId,
          source: 'client',
          metaResponse: JSON.stringify(result?.response ?? {}),
          success: result?.success ?? false,
        },
      }).catch((err: any) => {
        console.error('[meta-conversion] DB save error:', err?.message ?? err);
      });
    } else {
      processedEvents.add(eventId);
    }

    return NextResponse.json({ status: 'ok', eventId, success: result?.success });
  } catch (err: any) {
    console.error('[meta-conversion] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
