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

  // GA4 + Meta Pixel Event Tracking for Sticky Mobile Button
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
    
    // GA4 Events
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
    
    // Generate event_id for deduplication between browser and server
    const eventId = generateEventId()
    
    // Meta Pixel Lead Event with event_id for deduplication
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Phone Call Initiated',
          content_category: 'auto_insurance',
          value: 1.00,
          currency: 'USD'
        }, {
          eventID: eventId  // For deduplication with Conversion API
        })
        console.log('[Meta Pixel] Lead event tracked (sticky button), eventID:', eventId)
      } catch (error) {
        console.error('[Meta Pixel] tracking error:', error)
      }
    } else {
      console.warn('[Meta Pixel] fbq not available')
    }
    
    // Send to Conversion API with ENHANCED customer data for Event Match Quality
    if (typeof window !== 'undefined') {
      const { fbc, fbp } = getFacebookCookies()
      const externalId = getExternalId()
      
      // Build user_data with all available parameters for maximum Event Match Quality
      // IMPORTANT: event_id should NOT be in user_data - it's a separate field
      const userData: any = {
        external_id: externalId,
        fbc: fbc,
        fbp: fbp,
        phone: '+18666499062',  // E.164 format: +1 (country code) + 8666499062
        country: 'us',  // United States
      }
      
      // Enhanced logging with actual values (first few characters for verification)
      console.log('[DEDUPLICATION] Client-side event tracking (sticky button):', {
        event_id: eventId,
        pixel_eventID: eventId,
        api_event_id: eventId,
        note: 'SAME event_id sent to BOTH Pixel and Conversion API for deduplication'
      })
      console.log('[Conversion API] Sending enhanced user_data (sticky button):', {
        event_id: eventId,
        fbc: fbc ? `${fbc.substring(0, 15)}...` : null,
        fbp: fbp ? `${fbp.substring(0, 15)}...` : null,
        external_id: externalId,
        phone: '+18666499062 (will be hashed server-side)',
        country: 'us',
      })
      
      fetch('/api/meta-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,  // TOP-LEVEL event_id for deduplication (NOT in user_data)
          event_name: 'Lead',
          event_source_url: window.location.href,
          user_data: userData,
          custom_data: {
            content_name: 'Phone Call Initiated',
            content_category: 'auto_insurance',
            cta_location: 'sticky_mobile_button',
            phone_number: phoneNumber,
            value: 1.00,
            currency: 'USD'
          }
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('[Conversion API] success:', data)
        console.log('[DEDUPLICATION] ✓ Conversion API sent with event_id:', eventId)
      })
      .catch(err => console.error('[Conversion API] error:', err))
    }
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
