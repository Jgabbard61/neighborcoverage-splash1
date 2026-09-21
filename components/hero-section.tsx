'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Umbrella,
  Shield,
  Star,
  CheckCircle,
  Car,
  Home,
  HeartPulse,
  Flower2,
  Wrench,
  HardHat,
  Wind,
  Bug,
  Bath,
  AppWindow,
} from 'lucide-react';
import { CTAButton } from './cta-button';

const verticalPills = [
  { icon: Car, label: 'Auto' },
  { icon: Home, label: 'Home' },
  { icon: HeartPulse, label: 'Medicare' },
  { icon: Flower2, label: 'Final Expense' },
  { icon: Wrench, label: 'Plumbing' },
  { icon: HardHat, label: 'Roofing' },
  { icon: Wind, label: 'HVAC' },
  { icon: Bug, label: 'Pest Control' },
  { icon: Bath, label: 'Bath Remodels' },
  { icon: AppWindow, label: 'Windows' },
];

const trustBadges = [
  { icon: Shield, label: 'Licensed & Vetted Pros' },
  { icon: Star, label: '4.8/5 Rating' },
  { icon: CheckCircle, label: 'Free, No-Obligation Quotes' },
];

export function HeroSection() {
  return (
    <section className="relative pt-24 md:pt-28 pb-16 md:pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50/40" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left - Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 text-[#1E3A8A] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Umbrella className="w-4 h-4" />
              <span>Your Coverage Umbrella — Expert Advice, Neighborly Service</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E3A8A] leading-[1.08] tracking-tight mb-6">
              One Neighbor.{' '}
              <span className="text-[#F97316]">Total Coverage.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#374151] mb-6 leading-relaxed max-w-xl">
              From your car and home to your health and everything around the house —
              NeighborCoverage connects you with licensed advisors and vetted pros across
              <span className="font-semibold text-[#1E3A8A]"> 10 ways we&apos;ve got you covered.</span>
            </p>

            {/* Vertical pills */}
            <div className="flex flex-wrap gap-2 mb-8 max-w-xl">
              {verticalPills.map((p) => {
                const Icon = p.icon;
                return (
                  <span
                    key={p.label}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#F97316]" />
                    {p.label}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <CTAButton location="hero_section" variant="orange" size="lg" />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              {trustBadges.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-[#6B7280]"
                  >
                    <Icon className="w-4 h-4 text-[#1E3A8A]" />
                    <span>{badge.label}</span>
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
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <Image
                src="/images/home-hero-family.jpg"
                alt="Happy family standing together outside their home, fully protected"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/30 to-transparent" />

              {/* Floating umbrella badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/95 backdrop-blur rounded-full px-4 py-2 shadow-lg">
                <Umbrella className="w-5 h-5 text-[#F97316]" />
                <span className="text-sm font-bold text-[#1E3A8A]">10 Verticals, 1 Trusted Name</span>
              </div>

              {/* Floating stat card */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
                <div className="text-2xl font-bold text-[#1E3A8A]">One Call</div>
                <div className="text-xs text-[#6B7280]">covers it all</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
