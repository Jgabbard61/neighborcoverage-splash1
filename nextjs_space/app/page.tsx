'use client'

import Image from 'next/image'
import { Phone, Zap, BarChart3, Briefcase, Star, Shield, CheckCircle, PhoneCall, Lock, Home } from 'lucide-react'
import StickyCallButton from '@/components/sticky-call-button'

const PHONE_NUMBER = '(866) 649-9062'
const PHONE_LINK = 'tel:8666499062'

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

// GA4 Event Tracking Function
const trackCTAClick = (location: string) => {
  // CRITICAL: Only track on production domains
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const isProduction = hostname === 'www.neighborcoverage.com' || hostname === 'neighborcoverage.com'
    
    if (!isProduction) {
      console.log('[Tracking] Skipping CTA tracking - not production domain:', hostname)
      return
    }
  }
  
  // GA4 Event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: location,
        offer_type: 'auto_insurance',
        phone_number: PHONE_NUMBER,
      })
      console.log('[GA4] cta_click event tracked:', location)
    } catch (error) {
      console.error('[GA4] tracking error:', error)
    }
  } else {
    console.warn('[GA4] gtag not available')
  }
}

const trackCallInitiated = (location: string) => {
  // CRITICAL: Only track on production domains
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const isProduction = hostname === 'www.neighborcoverage.com' || hostname === 'neighborcoverage.com'
    
    if (!isProduction) {
      console.log('[Tracking] Skipping event tracking - not production domain:', hostname)
      return
    }
  }
  
  // GA4 Event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', 'call_initiated', {
        event_category: 'conversion',
        event_label: location,
        offer_type: 'auto_insurance',
        phone_number: PHONE_NUMBER,
        value: 1,
      })
      console.log('[GA4] call_initiated event tracked:', location)
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
      console.log('[Meta Pixel] Lead event tracked:', location, 'eventID:', eventId)
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
    const userData: any = {
      event_id: eventId,  // Same as browser event for deduplication
      external_id: externalId,
      fbc: fbc,
      fbp: fbp,
      phone: '+18666499062',  // E.164 format: +1 (country code) + 8666499062
      country: 'us',  // United States
    }
    
    console.log('[Conversion API] Sending enhanced user_data:', {
      event_id: eventId,
      has_fbc: !!fbc,
      has_fbp: !!fbp,
      has_external_id: !!externalId,
      has_phone: true,
    })
    
    fetch('/api/meta-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'Lead',
        event_source_url: window.location.href,
        user_data: userData,
        custom_data: {
          content_name: 'Phone Call Initiated',
          content_category: 'auto_insurance',
          cta_location: location,
          phone_number: PHONE_NUMBER,
          value: 1.00,
          currency: 'USD'
        }
      })
    })
    .then(res => res.json())
    .then(data => console.log('[Conversion API] success:', data))
    .catch(err => console.error('[Conversion API] error:', err))
  }
}

export default function HomePage() {
  return (
    <>
      {/* Header Section with Logo and Top-Right CTA */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Image
              src="https://cdn.abacus.ai/images/6ed37b7d-c866-4bdf-819b-2b2d15119789.png"
              alt="NeighborCoverage - Your Neighbor in Protection"
              width={160}
              height={60}
              priority
              className="w-40 h-auto"
            />
            
            {/* Top-Right CTA Button */}
            <a
              href={PHONE_LINK}
              className="inline-flex items-center justify-center gap-1.5 md:gap-2 bg-[#F97316] text-white px-3 py-2.5 md:px-6 md:py-3 rounded-full font-semibold text-xs md:text-base hover:bg-[#EA580C] transition-all shadow-md hover:shadow-lg"
              aria-label="Call NeighborCoverage now at (866) 649-9062"
              onClick={() => {
                trackCTAClick('header_top_right')
                trackCallInitiated('header_top_right')
              }}
            >
              <Phone className="h-3.5 w-3.5 md:h-5 md:w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Call Now: {PHONE_NUMBER}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Above the Fold */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Headline & CTA */}
            <div className="space-y-8 fade-in-up">
              {/* Tagline */}
              <div className="inline-flex items-center gap-2 bg-[#F97316] bg-opacity-10 px-4 py-2 rounded-full">
                <Home className="h-5 w-5 text-[#F97316]" />
                <span className="text-[#F97316] font-semibold text-sm">Your Neighbor in Protection</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-[#1E3A8A] font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
                  Coverage You Can Trust, Right Next Door
                </h1>
                <h2 className="text-xl md:text-2xl text-[#6B7280] font-normal">
                  Expert Advice, Neighborly Service. Compare auto insurance rates and get personalized quotes in minutes.
                </h2>
              </div>

              {/* Primary CTA Button - LARGE & PROMINENT */}
              <a
                href={PHONE_LINK}
                className="inline-flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 bg-[#F97316] text-white px-8 py-5 rounded-full font-bold text-lg md:text-xl hover:bg-[#EA580C] transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 w-full md:w-auto"
                aria-label="Call NeighborCoverage now at (866) 649-9062"
                onClick={() => {
                  trackCTAClick('hero_section')
                  trackCallInitiated('hero_section')
                }}
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0" />
                  <span>Call Now:</span>
                </div>
                <span className="whitespace-nowrap">{PHONE_NUMBER}</span>
              </a>

              {/* Secondary text under CTA */}
              <p className="text-[#6B7280] text-sm italic">
                ✓ One Call, All Your Coverage Needs
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 items-center pt-4">
                <div className="flex items-center gap-2 text-sm text-[#374151]">
                  <Shield className="h-5 w-5 text-[#F97316]" />
                  <span className="font-semibold">Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#374151]">
                  <Lock className="h-5 w-5 text-[#F97316]" />
                  <span className="font-semibold">100% Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#374151]">
                  <Star className="h-5 w-5 text-[#F97316] fill-[#F97316]" />
                  <span className="font-semibold">4.8/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-200">
              <Image
                src="https://cdn.abacus.ai/images/d4347980-fa9c-4c4d-aabb-670330bf4946.png"
                alt="Happy family standing next to their car, smiling"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <h2 className="text-center mb-4 text-[#1E3A8A] text-3xl md:text-4xl">
            Why Choose NeighborCoverage?
          </h2>
          <p className="text-center text-[#F97316] font-semibold text-lg mb-12">
            Simple Solutions, Neighborly Support
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-[#F9FAFB] rounded-lg p-8 text-center space-y-4 hover:shadow-lg smooth-transition border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316] bg-opacity-10 rounded-full">
                <Zap className="h-8 w-8 text-[#F97316]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E3A8A]">Fast & Easy</h3>
              <p className="text-[#374151] text-base">
                Get connected to a licensed advisor in seconds
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#F9FAFB] rounded-lg p-8 text-center space-y-4 hover:shadow-lg smooth-transition border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316] bg-opacity-10 rounded-full">
                <BarChart3 className="h-8 w-8 text-[#F97316]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E3A8A]">Compare Options</h3>
              <p className="text-[#374151] text-base">
                Access multiple carriers to find your best rate
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#F9FAFB] rounded-lg p-8 text-center space-y-4 hover:shadow-lg smooth-transition border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316] bg-opacity-10 rounded-full">
                <Briefcase className="h-8 w-8 text-[#F97316]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E3A8A]">Expert Guidance</h3>
              <p className="text-[#374151] text-base">
                Speak with experienced insurance professionals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MIDDLE CTA SECTION - PROMINENT & IN-YOUR-FACE */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-[#F97316] to-[#fb923c] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full mb-4">
              <PhoneCall className="h-6 w-6 text-white animate-pulse" />
              <span className="text-white font-bold text-lg">Advisors Standing By</span>
            </div>
            
            <h2 className="text-white font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
              Get Covered. Call Your Neighbors Today.
            </h2>
            
            <p className="text-white text-xl md:text-2xl font-light">
              We've Got Your Back, With True Neighborly Care
            </p>
            
            {/* HUGE CTA BUTTON */}
            <a
              href={PHONE_LINK}
              className="inline-flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 bg-white text-[#F97316] px-8 md:px-12 py-6 rounded-full font-bold text-xl md:text-3xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 w-full max-w-md md:w-auto"
              aria-label="Call NeighborCoverage now at (866) 649-9062"
              onClick={() => {
                trackCTAClick('middle_cta_section')
                trackCallInitiated('middle_cta_section')
              }}
            >
              <div className="flex items-center gap-3">
                <Phone className="h-8 w-8 md:h-10 md:w-10 animate-pulse flex-shrink-0" />
                <span>CALL NOW:</span>
              </div>
              <span className="whitespace-nowrap text-2xl md:text-3xl">{PHONE_NUMBER}</span>
            </a>
            
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">No Obligation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">Free Quotes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">Licensed Advisors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <h2 className="text-center mb-12 text-[#1E3A8A]">
            Trusted by Thousands of Drivers
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Trust Signal 1 */}
            <div className="bg-white rounded-lg p-6 text-center space-y-3 shadow-md border border-gray-100">
              <div className="flex justify-center gap-1">
                {[...Array(5)]?.map?.((_, i) => (
                  <Star key={i} className="h-6 w-6 text-[#F97316] fill-[#F97316]" />
                ))}
              </div>
              <p className="text-2xl font-bold text-[#1E3A8A]">4.8/5</p>
              <p className="text-sm text-[#6B7280]">Average Rating</p>
            </div>

            {/* Trust Signal 2 */}
            <div className="bg-white rounded-lg p-6 text-center space-y-3 shadow-md border border-gray-100">
              <Lock className="h-12 w-12 text-[#F97316] mx-auto" />
              <p className="text-base font-semibold text-[#1E3A8A]">
                Secure & Confidential
              </p>
              <p className="text-sm text-[#6B7280]">Your information is protected</p>
            </div>

            {/* Trust Signal 3 */}
            <div className="bg-white rounded-lg p-6 text-center space-y-3 shadow-md border border-gray-100">
              <CheckCircle className="h-12 w-12 text-[#F97316] mx-auto" />
              <p className="text-base font-semibold text-[#1E3A8A]">
                Licensed in All 50 States
              </p>
              <p className="text-sm text-[#6B7280]">Nationwide coverage</p>
            </div>

            {/* Trust Signal 4 */}
            <div className="bg-white rounded-lg p-6 text-center space-y-3 shadow-md border border-gray-100">
              <PhoneCall className="h-12 w-12 text-[#F97316] mx-auto" />
              <p className="text-base font-semibold text-[#1E3A8A]">
                No Obligation
              </p>
              <p className="text-sm text-[#6B7280]">Just honest advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <h2 className="text-center mb-12 text-[#1E3A8A]">
            Get Your Quote in 3 Simple Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="relative space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316] text-white text-2xl font-bold rounded-full mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A]">Call Now</h3>
              <p className="text-[#374151]">
                Speak with a licensed advisor
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316] text-white text-2xl font-bold rounded-full mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A]">Share Your Needs</h3>
              <p className="text-[#374151]">
                Tell us about your vehicle and coverage preferences
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316] text-white text-2xl font-bold rounded-full mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A]">Compare & Save</h3>
              <p className="text-[#374151]">
                Get personalized quotes from top carriers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#1E3A8A] to-[#1e40af] text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-white text-3xl md:text-5xl font-bold">
            Protecting What Matters, With Neighborly Service You Can Trust
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
            The Coverage Your Home & Auto Deserve, From Your Neighbors at NeighborCoverage
          </p>
          
          {/* Bottom CTA Button */}
          <a
            href={PHONE_LINK}
            className="inline-flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 bg-[#F97316] text-white px-8 md:px-10 py-5 rounded-full font-bold text-lg md:text-xl hover:bg-[#EA580C] transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 w-full max-w-md md:w-auto"
            aria-label="Call NeighborCoverage at (866) 649-9062"
            onClick={() => {
              trackCTAClick('bottom_cta_section')
              trackCallInitiated('bottom_cta_section')
            }}
          >
            <div className="flex items-center gap-2">
              <Phone className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0" />
              <span>Call Now:</span>
            </div>
            <span className="whitespace-nowrap">{PHONE_NUMBER}</span>
          </a>
          
          <p className="text-blue-200 text-sm italic">
            Local Care, Comprehensive Coverage ✓
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E3A8A] text-white py-12">
        <div className="container space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="h-8 w-8 text-[#F97316]" />
              <h3 className="text-2xl font-bold text-white">
                NeighborCoverage
              </h3>
            </div>
            <p className="text-[#F97316] font-semibold text-lg">
              Expert Advice, Neighborly Service
            </p>
            <p className="text-blue-200 text-sm max-w-3xl mx-auto leading-relaxed">
              NeighborCoverage connects you with licensed insurance professionals. 
              Rates and coverage vary by state, carrier, and individual circumstances. 
              Not all carriers available in all states.
            </p>
          </div>
          
          <div className="border-t border-blue-800 pt-6">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
              <a href="#" className="hover:text-white smooth-transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white smooth-transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white smooth-transition">
                Contact Us
              </a>
            </div>
          </div>
          
          <p className="text-center text-blue-300 text-sm">
            © {new Date()?.getFullYear?.()} NeighborCoverage. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Sticky Mobile Call Button */}
      <StickyCallButton phoneNumber={PHONE_NUMBER} phoneLink={PHONE_LINK} />
    </>
  )
}
