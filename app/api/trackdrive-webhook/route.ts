export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConversionEvent } from '@/lib/meta-conversions-api';

// In-memory dedup fallback when DB is not available
const firedConversions = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request?.text?.().catch(() => '');
    let body: Record<string, any> = {};
    try {
      body = JSON.parse(rawBody ?? '{}');
    } catch {
      console.error('[trackdrive-webhook] Invalid JSON body');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Optional signature verification
    const signature = request?.headers?.get?.('x-trackdrive-signature') ?? 
                     request?.headers?.get?.('x-webhook-secret') ?? '';
    const webhookSecret = process.env.TRACKDRIVE_WEBHOOK_SECRET ?? '';
    if (webhookSecret && webhookSecret !== 'YOUR_TRACKDRIVE_WEBHOOK_SECRET' && signature) {
      if (signature !== webhookSecret) {
        console.warn('[trackdrive-webhook] Signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const eventType = (body?.event_type ?? body?.event ?? body?.type ?? '') as string;
    const callId = (body?.call_id ?? body?.id ?? '') as string;
    const callerNumber = (body?.caller_number ?? body?.caller ?? body?.phone ?? '') as string;
    const duration = parseInt(String(body?.duration ?? body?.call_duration ?? body?.talk_time ?? '0'), 10) || 0;

    console.log(`[trackdrive-webhook] Received: ${eventType}, callId: ${callId}, duration: ${duration}s`);

    // Store webhook event in DB if available
    let webhookEventId: string | null = null;
    if (prisma) {
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          eventType: eventType || 'unknown',
          callId: callId || null,
          callerNumber: callerNumber || null,
          duration,
          payload: rawBody?.substring?.(0, 5000) ?? '',
          processedAt: new Date(),
        },
      }).catch((err: any) => {
        console.error('[trackdrive-webhook] DB save error:', err?.message ?? err);
        return null;
      });
      webhookEventId = webhookEvent?.id ?? null;
    }

    // Check if this is a qualifying call
    const threshold = parseInt(process.env.QUALIFIED_CALL_DURATION_THRESHOLD ?? '120', 10) || 120;
    const isQualified = (
      (eventType === 'Call Ended' || eventType === 'Lead Converted') && 
      duration >= threshold
    );

    if (isQualified && callId) {
      // Dedup check - DB first, fallback to in-memory
      const dedupKey = `qc_${callId}`;
      let isDuplicate = false;

      if (prisma) {
        const existing = await prisma.conversionEvent.findFirst({
          where: { callId, eventName: 'QualifiedCall' },
        }).catch(() => null);
        isDuplicate = !!existing;
      } else {
        isDuplicate = firedConversions.has(dedupKey);
      }

      if (!isDuplicate) {
        const eventId = `qc_${callId}_${Date.now()}`;
        
        console.log(`[trackdrive-webhook] Firing QualifiedCall for call ${callId} (${duration}s >= ${threshold}s)`);

        const clientIp = request?.headers?.get?.('x-forwarded-for')?.split(',')?.[0]?.trim?.() ?? '';

        const result = await sendConversionEvent({
          eventName: 'QualifiedCall',
          eventId,
          clientIpAddress: clientIp,
          customData: {
            call_id: callId,
            call_duration: duration,
            caller_number: callerNumber,
            threshold,
          },
        });

        // Store conversion
        if (prisma) {
          await prisma.conversionEvent.create({
            data: {
              eventName: 'QualifiedCall',
              eventId,
              source: 'trackdrive_webhook',
              callId,
              metaResponse: JSON.stringify(result?.response ?? {}),
              success: result?.success ?? false,
            },
          }).catch((err: any) => {
            console.error('[trackdrive-webhook] Conversion DB save error:', err?.message ?? err);
          });

          if (webhookEventId) {
            await prisma.webhookEvent.update({
              where: { id: webhookEventId },
              data: { conversionFired: true },
            }).catch(() => {});
          }
        } else {
          firedConversions.add(dedupKey);
        }

        return NextResponse.json({ 
          status: 'ok', qualified: true, conversionFired: true, eventId,
        });
      } else {
        console.log(`[trackdrive-webhook] Duplicate conversion skipped for call ${callId}`);
        return NextResponse.json({ status: 'ok', qualified: true, conversionFired: false, reason: 'duplicate' });
      }
    }

    return NextResponse.json({ status: 'ok', qualified: false });
  } catch (err: any) {
    console.error('[trackdrive-webhook] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'trackdrive-webhook' });
}
