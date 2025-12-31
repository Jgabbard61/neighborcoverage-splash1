'use client'

import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StickyCallButtonProps {
  phoneNumber: string
  phoneLink: string
}

// Helper function to get Facebook cookies for Event Match Quality
const getFacebookCookies = () => {
  if (typeof window === 'undefined') return { fbc: null, fbp: null }
  
  // Get _fbc (Facebook Click ID) cookie
  const fbcMatch = document.cookie.match(/(^|;)\s*_fbc\s*=\s*([^;]+)/)
  const fbc = fbcMatch ? fbcMatch[2] : null
  
  // Get _fbp (Facebook Browser ID) cookie
  const fbpMatch = document.cookie.match(/(^|;)\s*_fbp\s*=\s*([^;]+)/)
  const fbp = fbpMatch ? fbpMatch[2] : null
  
  return { fbc, fbp }
}

// Helper function to generate or retrieve External ID for user tracking
const getExternalId = () => {
  if (typeof window === 'undefined') return null
  
  // Try to get existing external_id from sessionStorage
  let externalId = sessionStorage.getItem('nc_external_id')
  
  // If not exists, generate a new one
  if (!externalId) {
    externalId = `nc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('nc_external_id', externalId)
  }
  
  return externalId
}

// Helper function to generate consistent event_id for deduplication
const generateEventId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export default function StickyCallButton({ phoneNumber, phoneLink }: StickyCallButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 200px on mobile (earlier trigger for more visibility)
      const shouldShow = window?.scrollY > 200
      setIsVisible(shouldShow)
    }

    // Check on mount
    handleScroll()

    // Add scroll listener
    window?.addEventListener?.('scroll', handleScroll)

    // Cleanup
    return () => window?.removeEventListener?.('scroll', handleScroll)
  }, [])

  // GA4 and Meta Event Tracking for Sticky Mobile Button
  const trackStickyButtonClick = () => {
    // CRITICAL: Only track on production domains
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const isProduction = hostname === 'www.neighborcoverage.com' || hostname === 'neighborcoverage.com'
      
      if (!isProduction) {
        console.log('[Tracking] Skipping sticky button tracking - not production domain:', hostname)
        return
      }
    }
    
    // GA4 Events - INTERNAL ANALYTICS ONLY
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        // Track CTA click
        (window as any).gtag('event', 'cta_click', {
          event_category: 'engagement',
          event_label: 'sticky_mobile_button',
          offer_type: 'auto_insurance',
          phone_number: phoneNumber,
        })
        // Track call initiated
        (window as any).gtag('event', 'call_initiated', {
          event_category: 'conversion',
          event_label: 'sticky_mobile_button',
          offer_type: 'auto_insurance',
          phone_number: phoneNumber,
          value: 1,
        })
        console.log('[GA4] events tracked: cta_click, call_initiated (sticky button)')
      } catch (error) {
        console.error('[GA4] tracking error:', error)
      }
    } else {
      console.warn('[GA4] gtag not available')
    }
    
    // ✅ SIMPLE META TRACKING - BUTTON CLICK → LEAD EVENT
    // IMPORTANT: This tracks button clicks, NOT actual phone calls.
    // Expected discrepancy: 30-50% of clicks may not result in actual calls.
    // This is a reasonable proxy for conversion tracking.
    // For 100% accurate call tracking, consider Retreaver webhook integration later.
    
    // Generate event_id for deduplication (MUST be at TOP LEVEL)
    const eventId = generateEventId()
    
    console.log('╔════════════════════════════════════════════════════════════')
    console.log('║ [DEDUPLICATION] Client generating event_id (Sticky Button)')
    console.log('║ event_id:', eventId)
    console.log('║ This ID will be sent to BOTH Pixel and Conversion API')
    console.log('║ Meta will deduplicate and count as 1 event')
    console.log('╚════════════════════════════════════════════════════════════')
    
    // Get Facebook cookies and External ID for Event Match Quality
    const { fbc, fbp } = getFacebookCookies()
    const externalId = getExternalId()
    
    // 1. META PIXEL - Fire "Lead" event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Auto Insurance Quote',
          content_category: 'insurance',
          value: 45.0,
          currency: 'USD',
        }, {
          eventID: eventId  // CRITICAL: event_id for deduplication
        })
        console.log('[Meta Pixel] Lead event tracked with eventID:', eventId, '(Sticky Button)')
      } catch (error) {
        console.error('[Meta Pixel] tracking error:', error)
      }
    } else {
      console.warn('[Meta Pixel] fbq not available')
    }
    
    // 2. META CONVERSION API - Send server-side event with SAME event_id
    fetch('/api/meta-conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: eventId,  // CRITICAL: SAME event_id as Pixel for deduplication
        event_name: 'Lead',
        event_source_url: window.location.href,
        custom_data: {
          content_name: 'Auto Insurance Quote',
          content_category: 'insurance',
          value: 45.0,
          currency: 'USD',
        },
        user_data: {
          fbc: fbc,
          fbp: fbp,
          external_id: externalId,
          phone: '18666499062',  // Business phone number
          country: 'us',
        },
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('[Conversion API] Response (Sticky Button):', data)
        console.log('╔════════════════════════════════════════════════════════════')
        console.log('║ [DEDUPLICATION] Conversion API called with event_id:', eventId)
        console.log('║ Pixel and Conversion API both used SAME event_id')
        console.log('║ Meta will deduplicate and count as 1 conversion')
        console.log('╚════════════════════════════════════════════════════════════')
      })
      .catch(error => {
        console.error('[Conversion API] Error:', error)
      })
  }

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50 
        md:hidden 
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
    >
      <div className="bg-gradient-to-r from-[#F97316] to-[#fb923c] shadow-2xl p-3">
        <a
          href={phoneLink}
          className="flex flex-col items-center justify-center gap-2 bg-white text-[#F97316] px-6 py-4 rounded-full font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg w-full"
          aria-label={`Call NeighborCoverage now at ${phoneNumber}`}
          onClick={trackStickyButtonClick}
        >
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 animate-pulse flex-shrink-0" />
            <span className="text-base">CALL NOW:</span>
          </div>
          <span className="text-xl font-extrabold whitespace-nowrap">{phoneNumber}</span>
        </a>
        <p className="text-center text-white text-xs mt-2 font-medium">
          ✓ Expert Advice, Neighborly Service
        </p>
      </div>
    </div>
  )
}
