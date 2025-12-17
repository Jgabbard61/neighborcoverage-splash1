import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Meta Conversions API Configuration
const PIXEL_ID = '1884617578809782'
const ACCESS_TOKEN = process.env.META_CONVERSION_API_TOKEN || ''

// Meta Conversions API Endpoint
const API_URL = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`

// Hash function for user data (required by Meta for privacy)
// Different data types require different normalization before hashing
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

    // Get geolocation data from Vercel headers (automatically provided on Vercel deployments)
    const geoCity = request.headers.get('x-vercel-ip-city') || ''
    const geoState = request.headers.get('x-vercel-ip-country-region') || ''
    const geoZip = request.headers.get('x-vercel-ip-postal-code') || ''
    
    // Decode city name from URL encoding (Vercel encodes city names)
    const decodedCity = geoCity ? decodeURIComponent(geoCity) : ''
    
    // Log geographic data for insights
    console.log('[Conversion API] Geographic data from IP:', {
      city: decodedCity || 'Not available',
      state: geoState || 'Not available',
      zip: geoZip || 'Not available',
      ip: clientIp ? `${clientIp.split(',')[0].substring(0, 10)}...` : 'Not available',
    })

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
    // CRITICAL: Meta requires hashed parameters as ARRAYS
    if (user_data?.phone) {
      enhancedUserData.ph = [hashData(user_data.phone, 'phone')]
    }

    // Add email if provided (hashed) - CRITICAL for Event Match Quality
    // CRITICAL: Meta requires hashed parameters as ARRAYS
    if (user_data?.email) {
      enhancedUserData.em = [hashData(user_data.email, 'email')]
    }

    // Add country if provided
    // CRITICAL: Meta requires hashed parameters as ARRAYS
    if (user_data?.country) {
      enhancedUserData.country = [hashData(user_data.country, 'country')]
    }

    // Add geographic data (prioritize IP geolocation over client-provided data)
    // CRITICAL: Meta requires hashed parameters as ARRAYS
    
    // Add city - use IP geolocation or fallback to client-provided data
    const cityToUse = decodedCity || user_data?.city
    if (cityToUse) {
      enhancedUserData.ct = [hashData(cityToUse, 'text')]
    }
    
    // Add state - use IP geolocation or fallback to client-provided data
    const stateToUse = geoState || user_data?.state
    if (stateToUse) {
      enhancedUserData.st = [hashData(stateToUse, 'text')]
    }
    
    // Add zip code - use IP geolocation (NEW: improves Event Match Quality)
    if (geoZip) {
      enhancedUserData.zp = [hashData(geoZip, 'text')]
    }

    // Enhanced logging with actual values (hashed values shown for verification)
    console.log('[Conversion API] Enhanced user_data being sent to Meta:', {
      fbc: enhancedUserData.fbc ? `${enhancedUserData.fbc.substring(0, 15)}...` : null,
      fbp: enhancedUserData.fbp ? `${enhancedUserData.fbp.substring(0, 15)}...` : null,
      external_id: enhancedUserData.external_id || null,
      ph_hashed_array: enhancedUserData.ph ? `[${enhancedUserData.ph[0].substring(0, 10)}...]` : null,
      em_hashed_array: enhancedUserData.em ? `[${enhancedUserData.em[0].substring(0, 10)}...]` : null,
      country_hashed_array: enhancedUserData.country ? `[${enhancedUserData.country[0].substring(0, 10)}...]` : null,
      ct_hashed_array: enhancedUserData.ct ? `[${enhancedUserData.ct[0].substring(0, 10)}...]` : null,
      st_hashed_array: enhancedUserData.st ? `[${enhancedUserData.st[0].substring(0, 10)}...]` : null,
      zp_hashed_array: enhancedUserData.zp ? `[${enhancedUserData.zp[0].substring(0, 10)}...]` : null,
      client_ip: enhancedUserData.client_ip_address ? `${enhancedUserData.client_ip_address.substring(0, 10)}...` : null,
      has_user_agent: !!enhancedUserData.client_user_agent,
    })
    
    // Log raw geographic data for campaign targeting insights
    console.log('[Conversion API] Geographic Insights:', {
      city_used: cityToUse || 'Not available',
      state_used: stateToUse || 'Not available',
      zip_used: geoZip || 'Not available',
      source: (decodedCity || geoState || geoZip) ? 'IP Geolocation (Vercel)' : 'Client-provided or unavailable',
    })
    
    // Log the complete payload structure being sent to Meta (for debugging)
    console.log('[Conversion API] Complete payload structure:', JSON.stringify({
      event_name: event_name || 'Lead',
      event_time: 'TIMESTAMP',
      event_id: eventId,
      event_source_url: event_source_url ? event_source_url.substring(0, 30) + '...' : 'N/A',
      action_source: 'website',
      user_data_keys: Object.keys(enhancedUserData),
      user_data_sample: {
        has_fbc: !!enhancedUserData.fbc,
        has_fbp: !!enhancedUserData.fbp,
        has_external_id: !!enhancedUserData.external_id,
        has_ph_array: Array.isArray(enhancedUserData.ph),
        has_em_array: Array.isArray(enhancedUserData.em),
        has_country_array: Array.isArray(enhancedUserData.country),
        has_ct_array: Array.isArray(enhancedUserData.ct),
        has_st_array: Array.isArray(enhancedUserData.st),
        has_zp_array: Array.isArray(enhancedUserData.zp),
        has_client_ip: !!enhancedUserData.client_ip_address,
        has_user_agent: !!enhancedUserData.client_user_agent,
      }
    }, null, 2))

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
