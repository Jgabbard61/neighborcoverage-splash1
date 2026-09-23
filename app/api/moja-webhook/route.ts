export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConversionEvent } from '@/lib/meta-conversions-api';

const firedConversions = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request?.text?.().catch(() => '');
    let body: Record<string, any> = {};
    try {
      body = JSON.parse(rawBody ?? '{}');
    } catch {
      console.error('[moja-webhook] Invalid JSON body');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Optional shared secret check (set MOJA_WEBHOOK_SECRET in Vercel env)
    const secret = request?.headers?.get?.('x-moja-secret') ??
                   request?.headers?.get?.('x-webhook-secret') ?? '';
    const webhookSecret = process.env.MOJA_WEBHOOK_SECRET ?? '';
    if (webhookSecret && webhookSecret !== 'YOUR_MOJA_WEBHOOK_SECRET' && secret && secret !== webhookSecret) {
      console.warn('[moja-webhook] Secret mismatch');
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    // Moja postback fields — covers common field names Moja may send
    const callId = String(body?.call_id ?? body?.callId ?? body?.id ?? '');
    const eventType = String(body?.event_type ?? body?.event ?? body?.status ?? body?.call_status ?? '');
    const duration = parseInt(String(body?.duration ?? body?.call_duration ?? body?.billable_duration ?? '0'), 10) || 0;
    const callerNumber = String(body?.caller_number ?? body?.from ?? body?.ani ?? body?.caller ?? '');
    const disposition = String(body?.disposition ?? body?.call_disposition ?? '');
    // Inbound DID (the number that was called) — used to route HVAC-specific conversions
    const did = String(body?.did ?? body?.dialed ?? body?.to ?? body?.dnis ?? body?.called_number ?? body?.target ?? '');

    console.log(`[moja-webhook] Received: event=${eventType}, callId=${callId}, duration=${duration}s, disposition=${disposition}`);

    // Store raw webhook event in DB if available
    let webhookEventId: string | null = null;
    if (prisma) {
      const webhookEvent = await (prisma as any).webhookEvent?.create?.({
        data: {
          eventType: eventType || 'moja_postback',
          callId: callId || null,
          callerNumber: callerNumber || null,
          duration,
          payload: rawBody?.substring?.(0, 5000) ?? '',
          processedAt: new Date(),
        },
      }).catch((err: any) => {
        console.error('[moja-webhook] DB save error:', err?.message ?? err);
        return null;
      });
      webhookEventId = webhookEvent?.id ?? null;
    }

    // Qualify: fire CAPI conversion if the call was connected/answered with enough duration
    // Moja typically sends status "completed", "answered", or "billable" for connected calls
    const qualifyingStatuses = ['completed', 'answered', 'billable', 'connected', 'call_ended', 'lead_converted'];
    const threshold = parseInt(process.env.QUALIFIED_CALL_DURATION_THRESHOLD ?? '60', 10) || 60;
    
    const isQualified = callId && (
      qualifyingStatuses.some(s => eventType.toLowerCase().includes(s)) ||
      disposition.toLowerCase() === 'answered' ||
      duration >= threshold
    );

    if (isQualified) {
      const dedupKey = `moja_qc_${callId}`;
      let isDuplicate = false;

      if (prisma) {
        const existing = await (prisma as any).conversionEvent?.findFirst?.({
          where: { callId, eventName: 'QualifiedCall' },
        }).catch(() => null);
        isDuplicate = !!existing;
      } else {
        isDuplicate = firedConversions.has(dedupKey);
      }

      if (!isDuplicate) {
        const eventId = `moja_qc_${callId}_${Date.now()}`;
        const clientIp = request?.headers?.get?.('x-forwarded-for')?.split(',')?.[0]?.trim?.() ?? '';

        console.log(`[moja-webhook] Firing QualifiedCall for callId ${callId} (${duration}s)`);

        const result = await sendConversionEvent({
          eventName: 'QualifiedCall',
          eventId,
          clientIpAddress: clientIp,
          customData: {
            call_id: callId,
            call_duration: duration,
            caller_number: callerNumber,
            disposition,
            source: 'moja',
          },
        });

        // HVAC-specific conversion — fire an ADDITIONAL event when the call came in on the HVAC DID (8888139665)
        if (did.replace(/[^0-9]/g, '').indexOf('8888139665') >= 0) {
          const hvacEventId = `${eventId}-hv`;
          console.log(`[moja-webhook] Firing HVAC_QualifiedCall for callId ${callId} (DID ${did})`);

          const hvacResult = await sendConversionEvent({
            eventName: 'HVAC_QualifiedCall',
            eventId: hvacEventId,
            clientIpAddress: clientIp,
            customData: {
              call_id: callId,
              call_duration: duration,
              caller_number: callerNumber,
              did,
              disposition,
              source: 'moja',
            },
          });

          if (prisma) {
            await (prisma as any).conversionEvent?.create?.({
              data: {
                eventName: 'HVAC_QualifiedCall',
                eventId: hvacEventId,
                source: 'moja_webhook',
                callId,
                metaResponse: JSON.stringify(hvacResult?.response ?? {}),
                success: hvacResult?.success ?? false,
              },
            }).catch((err: any) => {
              console.error('[moja-webhook] HVAC conversion DB save error:', err?.message ?? err);
            });
          }
        }

        if (prisma) {
          await (prisma as any).conversionEvent?.create?.({
            data: {
              eventName: 'QualifiedCall',
              eventId,
              source: 'moja_webhook',
              callId,
              metaResponse: JSON.stringify(result?.response ?? {}),
              success: result?.success ?? false,
            },
          }).catch((err: any) => {
            console.error('[moja-webhook] Conversion DB save error:', err?.message ?? err);
          });

          if (webhookEventId) {
            await (prisma as any).webhookEvent?.update?.({
              where: { id: webhookEventId },
              data: { conversionFired: true },
            }).catch(() => {});
          }
        } else {
          firedConversions.add(dedupKey);
        }

        return NextResponse.json({ status: 'ok', qualified: true, conversionFired: true, eventId });
      } else {
        console.log(`[moja-webhook] Duplicate conversion skipped for callId ${callId}`);
        return NextResponse.json({ status: 'ok', qualified: true, conversionFired: false, reason: 'duplicate' });
      }
    }

    return NextResponse.json({ status: 'ok', qualified: false });
  } catch (err: any) {
    console.error('[moja-webhook] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'moja-webhook' });
}
