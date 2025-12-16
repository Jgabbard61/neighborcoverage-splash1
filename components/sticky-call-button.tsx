'use client'

import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StickyCallButtonProps {
  phoneNumber: string
  phoneLink: string
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

  // GA4 Event Tracking for Sticky Mobile Button
  const trackStickyButtonClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: 'sticky_mobile_button',
        offer_type: 'auto_insurance',
        phone_number: phoneNumber,
      })
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
          className="flex flex-col items-center justify-center gap-2 bg-white text-[#F97316] px-6 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg w-full"
          aria-label={`Call NeighborCoverage now at ${phoneNumber}`}
          onClick={trackStickyButtonClick}
          // TODO: Add Meta Pixel Contact event when Meta Pixel is configured
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
