'use client';

import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { trackInitiateCall } from '@/lib/meta-pixel';

const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '000-000-0000';
const PHONE_TEL = `tel:${(PHONE_NUMBER ?? '').replace?.(/[^0-9]/g, '') ?? ''}`;

export function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible((window?.scrollY ?? 0) > 200);
    };
    window?.addEventListener?.('scroll', handleScroll);
    return () => window?.removeEventListener?.('scroll', handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    trackInitiateCall('sticky_mobile_button');
    setTimeout(() => { window.location.href = PHONE_TEL; }, 300);
  };

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50 md:hidden
        transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
    >
      <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <a
          href={PHONE_TEL}
          onClick={handleClick}
          className="flex items-center justify-center gap-3 text-white font-bold text-lg"
        >
          <Phone className="w-5 h-5 animate-pulse-ring" />
          <span>CALL NOW: {PHONE_NUMBER}</span>
        </a>
      </div>
    </div>
  );
}
