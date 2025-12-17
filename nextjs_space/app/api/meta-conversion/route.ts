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
    const { event_name, event_source_url, custom_data, user_data } = body

    // CRITICAL: Only track events from production domains
    if (event_source_url) {
      try {
        const url = new URL(event_source_url)
        const hostname = url.hostname
        const isProduction = hostname === 'www.neighborcoverage.com' || hostname === 'neighborcoverage.com'
        
        if (!isProduction) {
          console.log('[Conversion API] Skipping - not production domain:', hostname)
          return NextResponse.json({ 
            success: false, 
            message: 'Events only tracked on production domains',
            hostname: hostname 
          })
        }
      } catch (urlError) {
        console.error('[Conversion API] Invalid event_source_url:', urlError)
      }
    }

    // Get client IP and user agent for better tracking
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const userAgent = request.headers.get('user-agent') || ''

    // Use event_id from client for proper deduplication, or generate one
    const eventId = user_data?.event_id || generateEventId()

    // Build enhanced user_data object with all available parameters
    const enhancedUserData: any = {
      client_ip_address: clientIp.split(',')[0].trim(),
      client_user_agent: userAgent,
    }

    // Add Facebook Click ID (fbc) if provided - CRITICAL for Event Match Quality
    if (user_data?.fbc) {
      enhancedUserData.fbc = user_data.fbc
    }

    // Add Facebook Browser ID (fbp) if provided - CRITICAL for Event Match Quality
    if (user_data?.fbp) {
      enhancedUserData.fbp = user_data.fbp
    }

    // Add External ID if provided - helps with deduplication and matching
    if (user_data?.external_id) {
      enhancedUserData.external_id = user_data.external_id
    }

    // Add business phone number (hashed) - improves Event Match Quality
    // Using the NeighborCoverage phone number as customer contact point
    if (user_data?.phone) {
      enhancedUserData.ph = hashData(user_data.phone)
    }

    // Add email if provided (hashed) - CRITICAL for Event Match Quality
    if (user_data?.email) {
      enhancedUserData.em = hashData(user_data.email)
    }

    // Add country if provided
    if (user_data?.country) {
      enhancedUserData.country = hashData(user_data.country)
    }

    // Add state if provided
    if (user_data?.state) {
      enhancedUserData.st = hashData(user_data.state)
    }

    // Add city if provided
    if (user_data?.city) {
      enhancedUserData.ct = hashData(user_data.city)
    }

    // Enhanced logging with actual values (hashed values shown for verification)
    console.log('[Conversion API] Enhanced user_data being sent to Meta:', {
      fbc: enhancedUserData.fbc ? `${enhancedUserData.fbc.substring(0, 15)}...` : null,
      fbp: enhancedUserData.fbp ? `${enhancedUserData.fbp.substring(0, 15)}...` : null,
      external_id: enhancedUserData.external_id || null,
      ph_hashed: enhancedUserData.ph ? `${enhancedUserData.ph.substring(0, 10)}...` : null,
      em_hashed: enhancedUserData.em ? `${enhancedUserData.em.substring(0, 10)}...` : null,
      country_hashed: enhancedUserData.country ? `${enhancedUserData.country.substring(0, 10)}...` : null,
      client_ip: enhancedUserData.client_ip_address ? `${enhancedUserData.client_ip_address.substring(0, 10)}...` : null,
      has_user_agent: !!enhancedUserData.client_user_agent,
    })

    // Prepare event data for Meta Conversions API
    const eventData = {
      data: [
        {
          event_name: event_name || 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: event_source_url || '',
          action_source: 'website',
          user_data: enhancedUserData,
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
        console.error('[Conversion API] Meta API ERROR:', JSON.stringify(result, null, 2))
        return NextResponse.json(
          { error: 'Failed to send event to Meta', details: result },
          { status: 500 }
        )
      }

      // Log successful Meta API response
      console.log('[Conversion API] Meta API SUCCESS:', {
        event_id: eventId,
        events_received: result.events_received || 0,
        messages: result.messages || [],
        fbtrace_id: result.fbtrace_id || 'N/A',
      })

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
