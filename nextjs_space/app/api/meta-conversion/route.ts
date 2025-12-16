import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Meta Conversions API Configuration
const PIXEL_ID = '1884617578809782'
const ACCESS_TOKEN = process.env.META_CONVERSION_API_TOKEN || ''

// Meta Conversions API Endpoint
const API_URL = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`

// Hash function for user data (required by Meta for privacy)
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
}

// Generate event ID for deduplication (browser + server events with same ID = counted once)
function generateEventId(): string {
  return crypto.randomBytes(16).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_name, event_source_url, custom_data } = body

    // Get client IP and user agent for better tracking
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const userAgent = request.headers.get('user-agent') || ''

    // Generate event ID (should ideally come from client for deduplication)
    const eventId = generateEventId()

    // Prepare event data for Meta Conversions API
    const eventData = {
      data: [
        {
          event_name: event_name || 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: event_source_url || '',
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp.split(',')[0].trim(),
            client_user_agent: userAgent,
            // Add hashed email/phone if you collect them in a form
            // em: hashData('user@example.com'),
            // ph: hashData('+15551234567'),
          },
          custom_data: custom_data || {},
        },
      ],
      access_token: ACCESS_TOKEN,
    }

    // Send to Meta Conversions API
    if (ACCESS_TOKEN) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Meta Conversions API error:', result)
        return NextResponse.json(
          { error: 'Failed to send event to Meta', details: result },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, event_id: eventId, meta_response: result })
    } else {
      // If no access token, still return success for testing
      console.warn('META_CONVERSION_API_TOKEN not configured, skipping server-side tracking')
      return NextResponse.json({ 
        success: true, 
        event_id: eventId, 
        note: 'Conversion API token not configured' 
      })
    }
  } catch (error) {
    console.error('Conversion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
