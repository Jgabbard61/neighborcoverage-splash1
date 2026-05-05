'use client';

import { Shield, Phone } from 'lucide-react';

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E3A8A] text-white py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#F97316]" fill="#F97316" strokeWidth={0} />
            <div>
              <span className="text-xl font-bold">NeighborCoverage</span>
              <p className="text-white/60 text-sm">Expert Advice, Neighborly Service</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex gap-6 text-sm text-white/70">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center text-white/50 text-xs max-w-3xl mx-auto space-y-2">
            <p>
              NeighborCoverage connects you with licensed insurance professionals.
              Rates and coverage vary by state, carrier, and individual circumstances.
              Not all carriers available in all states.
            </p>
            <p>© {currentYear} NeighborCoverage. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
