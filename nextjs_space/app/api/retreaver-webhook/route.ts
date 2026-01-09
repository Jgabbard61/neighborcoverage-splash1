import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Meta Conversions API Configuration
const PIXEL_ID = '1884617578809782'
const ACCESS_TOKEN = process.env.META_CONVERSION_API_TOKEN || ''

// Meta Conversions API Endpoint
const API_URL = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`

// Minimum call duration to qualify as a conversion (in seconds)
// Buyer requirement: 140+ seconds for payment
const MIN_CALL_DURATION = 140

// Hash function for user data (required by Meta for privacy)
function hashData(data: string, type: 'email' | 'phone' | 'text' | 'country' = 'text'): string {
  let normalized = data.trim()
  
  if (type === 'phone') {
    // Phone: Remove all symbols (+, -, spaces, parentheses), keep only digits
    // Must include country code (e.g., 18666499062 for US number)
    normalized = normalized.replace(/[^\d]/g, '')
  } else if (type === 'email' || type === 'text' || type === 'country') {
    // Email, names, city, state, zip, country: Lowercase and trim
    normalized = normalized.toLowerCase()
  }
  
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

// Generate event ID for deduplication
function generateEventId(): string {
  return crypto.randomBytes(16).toString('hex')
}

// Health check endpoint
export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Retreaver webhook endpoint ready',
    min_call_duration: MIN_CALL_DURATION,
    note: 'Use GET method for Retreaver webhooks'
  })
}

// Main webhook handler - Retreaver uses GET for "If call reached a buyer" trigger
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from URL
    const { searchParams } = new URL(request.url)
    
    // Parse Retreaver data from query parameters
    const payload = {
      call_id: searchParams.get('call_id') || searchParams.get('id'),
      call_duration: parseInt(searchParams.get('call_duration') || searchParams.get('duration') || '0'),
      call_status: searchParams.get('call_status') || searchParams.get('status') || 'completed',
      caller_number: searchParams.get('caller_number') || searchParams.get('caller') || searchParams.get('ani'),
      caller_city: searchParams.get('caller_city') || searchParams.get('city'),
      caller_state: searchParams.get('caller_state') || searchParams.get('state'),
      caller_zip: searchParams.get('caller_zip') || searchParams.get('zip'),
      caller_country: searchParams.get('caller_country') || searchParams.get('country') || 'US',
      call_timestamp: searchParams.get('call_timestamp') || searchParams.get('timestamp') || new Date().toISOString(),
      campaign_id: searchParams.get('campaign_id') || searchParams.get('campaign'),
      campaign_name: searchParams.get('campaign_name'),
    }
    
    console.log('╔════════════════════════════════════════════════════════════')
    console.log('║ [Retreaver Webhook] Received call data')
    console.log('║ Call ID:', payload.call_id || 'N/A')
    console.log('║ Duration:', payload.call_duration || 0, 'seconds')
    console.log('║ Status:', payload.call_status || 'N/A')
    console.log('╚════════════════════════════════════════════════════════════')
    
    // Extract call data from Retreaver webhook
    const {
      call_id,
      call_duration = 0,
      call_status,
      caller_number,
      caller_city,
      caller_state,
      caller_zip,
      caller_country = 'US',
      call_timestamp,
      campaign_id,
      campaign_name,
    } = payload
    
    // Check if call qualifies as a conversion
    const isQualified = call_duration >= MIN_CALL_DURATION
    
    if (!isQualified) {
      console.log('[Retreaver Webhook] Call does not qualify:', {
        call_id,
        duration: call_duration,
        min_required: MIN_CALL_DURATION,
        reason: 'Duration too short'
      })
      return NextResponse.json({
        success: true,
        message: 'Call received but did not qualify',
        call_id,
        duration: call_duration,
        qualified: false
      })
    }
    
    console.log('╔════════════════════════════════════════════════════════════')
    console.log('║ [Retreaver Webhook] ✅ QUALIFIED CALL')
    console.log('║ Call ID:', call_id)
    console.log('║ Duration:', call_duration, 'seconds (≥', MIN_CALL_DURATION, 'required)')
    console.log('║ Sending QualifiedCall event to Meta...')
    console.log('╚════════════════════════════════════════════════════════════')
    
    // Generate event ID for this qualified call
    const eventId = generateEventId()
    
    // Build enhanced user_data object
    const enhancedUserData: any = {
      // Use business phone as primary identifier
      ph: [hashData('+18666499062', 'phone')],
      country: [hashData(caller_country.toLowerCase(), 'country')],
    }
    
    // Add caller phone if provided (additional matching signal)
    if (caller_number) {
      // Normalize to E.164 format (add +1 if US number without country code)
      const normalizedPhone = caller_number.startsWith('+') 
        ? caller_number 
        : `+1${caller_number.replace(/[^\d]/g, '')}`
      enhancedUserData.ph = [hashData(normalizedPhone, 'phone')]
    }
    
    // Add geographic data from Retreaver
    if (caller_city) {
      enhancedUserData.ct = [hashData(caller_city, 'text')]
    }
    
    if (caller_state) {
      enhancedUserData.st = [hashData(caller_state, 'text')]
    }
    
    if (caller_zip) {
      enhancedUserData.zp = [hashData(caller_zip, 'text')]
    }
    
    // Log what we're sending to Meta
    console.log('[Retreaver Webhook] User data for Meta:', {
      event_id: eventId,
      has_phone: !!enhancedUserData.ph,
      has_country: !!enhancedUserData.country,
      has_city: !!enhancedUserData.ct,
      has_state: !!enhancedUserData.st,
      has_zip: !!enhancedUserData.zp,
    })
    
    // Prepare event data for Meta Conversions API
    const eventData = {
      data: [
        {
          event_name: 'QualifiedCall',
          event_time: call_timestamp ? Math.floor(new Date(call_timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'phone_call',
          user_data: enhancedUserData,
          custom_data: {
            content_name: 'Qualified Phone Call',
            content_category: 'auto_insurance',
            call_duration: call_duration,
            call_id: call_id,
            campaign_id: campaign_id,
            campaign_name: campaign_name,
            value: 45.00, // Average value of qualified call
            currency: 'USD'
          },
        },
      ],
      access_token: ACCESS_TOKEN,
    }
    
    // Send to Meta Conversions API
    if (!ACCESS_TOKEN) {
      console.warn('[Retreaver Webhook] No Meta access token configured - skipping Meta API call')
      return NextResponse.json({
        success: true,
        message: 'Qualified call processed (Meta API disabled)',
        call_id,
        duration: call_duration,
        qualified: true,
        event_id: eventId
      })
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('[Retreaver Webhook] Meta API ERROR:', JSON.stringify(result, null, 2))
      return NextResponse.json(
        {
          error: 'Failed to send event to Meta',
          details: result,
          call_id,
          event_id: eventId
        },
        { status: 500 }
      )
    }
    
    // Log success
    console.log('╔════════════════════════════════════════════════════════════')
    console.log('║ [Retreaver Webhook] ✅ SUCCESS - Meta API Response')
    console.log('║ Call ID:', call_id)
    console.log('║ Event ID:', eventId)
    console.log('║ Duration:', call_duration, 'seconds')
    console.log('║ Events Received:', result.events_received || 0)
    console.log('║ FB Trace ID:', result.fbtrace_id || 'N/A')
    console.log('╚════════════════════════════════════════════════════════════')
    
    return NextResponse.json({
      success: true,
      message: 'Qualified call tracked in Meta',
      call_id,
      event_id: eventId,
      duration: call_duration,
      qualified: true,
      meta_response: result
    })
    
  } catch (error) {
    console.error('[Retreaver Webhook] Error processing webhook:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


