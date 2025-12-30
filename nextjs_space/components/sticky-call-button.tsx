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

  // GA4 Event Tracking for Sticky Mobile Button - INTERNAL ANALYTICS ONLY
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
    
    // ⚠️ META TRACKING REMOVED - DECEMBER 2025 FIX
    // Meta "Lead" events were firing on BUTTON CLICK, not actual call completion.
    // This caused 76% false positive rate (220 Meta events vs 53 actual Retreaver calls).
    // 
    // NEW TRACKING APPROACH:
    // - Meta conversions now tracked ONLY via Retreaver webhook → /api/retreaver-webhook
    // - Webhook fires when call connects and meets duration threshold (30+ seconds)
    // - This ensures 100% accuracy: Meta conversions = actual qualified calls
    // 
    // Previous code removed:
    // - fbq('track', 'Lead', ...) - Pixel event on click
    // - fetch('/api/meta-conversion', ...) - Conversion API on click
    // 
    // See: /RETREAVER_INTEGRATION_GUIDE.md for new implementation details
    
    console.log('[Meta Tracking] Mobile button click events no longer tracked - using Retreaver webhook for qualified calls only')
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
