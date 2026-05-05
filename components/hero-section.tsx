'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Star, CheckCircle } from 'lucide-react';
import { CTAButton } from './cta-button';
import Image from 'next/image';

const trustBadges = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Lock, label: '100% Secure' },
  { icon: Star, label: '4.8/5 Rating' },
];

export function HeroSection() {
  return (
    <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50/30" />
      
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 text-[#1E3A8A] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>Expert Advice, Neighborly Service</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E3A8A] leading-[1.1] tracking-tight mb-6">
              Coverage You Can{' '}
              <span className="text-[#F97316]">Trust</span>, Right Next Door
            </h1>

            <p className="text-lg md:text-xl text-[#374151] mb-4 leading-relaxed max-w-lg">
              Compare auto insurance rates and get personalized quotes in minutes.
            </p>

            <div className="flex items-center gap-2 text-[#1E3A8A] font-medium mb-8">
              <CheckCircle className="w-5 h-5 text-[#F97316]" />
              <span>One Call, All Your Coverage Needs</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <CTAButton location="hero_section" variant="orange" size="lg" />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              {(trustBadges ?? []).map((badge: any, i: number) => {
                const Icon = badge?.icon ?? Shield;
                return (
                  <motion.div
                    key={badge?.label ?? i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-[#6B7280]"
                  >
                    <Icon className="w-4 h-4 text-[#1E3A8A]" />
                    <span>{badge?.label ?? ''}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://cdn.abacus.ai/images/b7caeb29-27b1-4f28-bca5-78fd8c9faa3f.png"
                alt="Happy family standing next to their car, smiling with confidence"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
