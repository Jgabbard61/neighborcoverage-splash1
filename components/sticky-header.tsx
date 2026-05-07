'use client';

import { useState, useEffect } from 'react';
import { Phone, Shield } from 'lucide-react';
import { CTAButton } from './cta-button';
import { trackInitiateCall } from '@/lib/meta-pixel';
import Image from 'next/image';

const PHONE_TEL = `tel:${(process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '000-000-0000').replace?.(/[^0-9]/g, '') ?? ''}`;

export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled((window?.scrollY ?? 0) > 20);
    };
    window?.addEventListener?.('scroll', handleScroll);
    return () => window?.removeEventListener?.('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[72px]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 md:w-10 md:h-10">
            <Shield className="w-full h-full text-[#1E3A8A]" fill="#1E3A8A" strokeWidth={0} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-[#1E3A8A] leading-tight tracking-tight">
              NeighborCoverage
            </span>
            <span className="text-[10px] md:text-xs text-[#6B7280] leading-tight hidden sm:block">
              Your Neighbor in Protection
            </span>
          </div>
        </div>

        {/* Header CTA */}
        <CTAButton
          location="header_top_right"
          variant="orange"
          size="sm"
          className="hidden sm:inline-flex"
        />
        <a
          href={PHONE_TEL}
          onClick={(e) => {
            e.preventDefault();
            trackInitiateCall('header_mobile_icon');
            setTimeout(() => { window.location.href = PHONE_TEL; }, 300);
          }}
          className="sm:hidden bg-[#F97316] text-white p-2.5 rounded-full shadow-lg hover:bg-[#EA580C] transition-colors"
          aria-label="Call Now"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
}
