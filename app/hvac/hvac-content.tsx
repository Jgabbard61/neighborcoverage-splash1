'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import {
  Phone,
  Shield,
  Star,
  CheckCircle,
  Zap,
  ThumbsUp,
  Wind,
  Flame,
  Wrench,
  Clock,
  UserCheck,
  BarChart3,
  ShieldCheck,
  Award,
  HardHat,
} from 'lucide-react';

const PHONE_DISPLAY = '(888) 813-9665';
const PHONE_TEL = 'tel:+18888139665';

/* ---------------------------------------------------------------- */
/* Local hardcoded CTA button (mirrors components/cta-button.tsx)    */
/* ---------------------------------------------------------------- */
function HvacCTA({
  location,
  variant = 'orange',
  size = 'md',
  className = '',
  showIcon = true,
  label,
}: {
  location: string;
  variant?: 'orange' | 'white' | 'navy' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
  label?: string;
}) {
  const sizeClasses: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl md:text-2xl',
  };

  const variantClasses: Record<string, string> = {
    orange: 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-lg hover:shadow-xl',
    white: 'bg-white hover:bg-gray-50 text-[#1E3A8A] shadow-lg hover:shadow-xl',
    navy: 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-white shadow-lg hover:shadow-xl',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10',
  };

  return (
    <a
      href={PHONE_TEL}
      data-cta-location={location}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-bold
        transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
        ${sizeClasses?.[size] ?? sizeClasses.md}
        ${variantClasses?.[variant] ?? variantClasses.orange}
        ${className}
      `}
    >
      {showIcon && <Phone className="w-5 h-5 flex-shrink-0" />}
      <span>{label ?? `Call Now: ${PHONE_DISPLAY}`}</span>
    </a>
  );
}

/* ---------------------------------------------------------------- */
/* 1. Sticky Header                                                  */
/* ---------------------------------------------------------------- */
function HvacHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled((window?.scrollY ?? 0) > 20);
    window?.addEventListener?.('scroll', handleScroll);
    return () => window?.removeEventListener?.('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[72px]">
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

        <HvacCTA
          location="hvac_header"
          variant="orange"
          size="sm"
          className="hidden sm:inline-flex"
        />
        <a
          href={PHONE_TEL}
          data-cta-location="hvac_header"
          className="sm:hidden bg-[#F97316] text-white p-2.5 rounded-full shadow-lg hover:bg-[#EA580C] transition-colors"
          aria-label="Call Now"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */
/* 2. Hero Section                                                   */
/* ---------------------------------------------------------------- */
const heroServicePills = [
  { icon: Wind, label: 'AC Repair' },
  { icon: Flame, label: 'Furnace Service' },
  { icon: Wrench, label: 'Heat Pump' },
  { icon: HardHat, label: 'New Installation' },
  { icon: Zap, label: 'Emergency Service' },
  { icon: Award, label: 'Maintenance' },
];

const heroTrustBadges = [
  { icon: Shield, label: 'Licensed Technicians' },
  { icon: Star, label: 'Vetted & Reviewed' },
  { icon: CheckCircle, label: 'No Obligation to Connect' },
];

function HvacHero() {
  return (
    <section className="relative pt-24 md:pt-28 pb-16 md:pb-20 overflow-hidden">
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
              <Wind className="w-4 h-4" />
              <span>HVAC Specialists Standing By — Call Now</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E3A8A] leading-[1.08] tracking-tight mb-6">
              Expert HVAC Service{' '}
              <span className="text-[#F97316]">In Your Neighborhood.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#374151] mb-6 leading-relaxed max-w-xl">
              AC not cooling? Furnace on the fritz? One call connects you with a licensed,
              local HVAC technician ready to get your home
              <span className="font-semibold text-[#1E3A8A]"> comfortable again — fast.</span>
            </p>

            {/* Service pills */}
            <div className="flex flex-wrap gap-2 mb-8 max-w-xl">
              {heroServicePills.map((p) => {
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
              <HvacCTA location="hvac_hero" variant="orange" size="lg" />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              {heroTrustBadges.map((badge, i) => {
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
                src="/images/hvac.jpg"
                alt="HVAC technician servicing a home air conditioning unit"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/30 to-transparent" />

              {/* Floating badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/95 backdrop-blur rounded-full px-4 py-2 shadow-lg">
                <Wind className="w-5 h-5 text-[#F97316]" />
                <span className="text-sm font-bold text-[#1E3A8A]">Licensed HVAC Pros</span>
              </div>

              {/* Floating stat card */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
                <div className="text-2xl font-bold text-[#1E3A8A]">One Call</div>
                <div className="text-xs text-[#6B7280]">gets you covered</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 3. Trust Stats                                                    */
/* ---------------------------------------------------------------- */
const trustItems = [
  { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'text-[#F97316]' },
  { icon: ShieldCheck, value: 'Licensed', label: 'Vetted technicians only', color: 'text-[#1E3A8A]' },
  { icon: Clock, value: 'Same-Day', label: 'Service available', color: 'text-emerald-600' },
  { icon: ThumbsUp, value: 'No Obligation', label: 'Just honest help', color: 'text-purple-600' },
];

function HvacTrust() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#F9FAFB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] tracking-tight mb-3">
            Trusted for HVAC Service Across the Country
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 ${item.color}`} />
                <div className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-1">{item.value}</div>
                <p className="text-[#6B7280] text-sm">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 4. How It Works                                                   */
/* ---------------------------------------------------------------- */
const howSteps = [
  {
    icon: Phone,
    step: '1',
    title: 'Call Now',
    description: 'Reach our HVAC specialist line — no hold music, no runaround.',
  },
  {
    icon: Wrench,
    step: '2',
    title: 'Get Matched',
    description: 'We connect you to a vetted local HVAC technician in your area.',
  },
  {
    icon: CheckCircle,
    step: '3',
    title: 'Service Completed',
    description: 'Your tech diagnoses the problem and gets your system running right.',
  },
];

function HvacHowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] tracking-tight mb-3">
            Get Your HVAC Fixed in 3 Simple Steps
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8">
          {howSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {i < howSteps.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#1E3A8A]/20 to-[#F97316]/20" />
                )}

                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] text-white mb-5 shadow-lg">
                  <Icon className="w-8 h-8" />
                  <span className="absolute -top-1 -right-1 w-7 h-7 bg-[#F97316] text-white text-sm font-bold rounded-full flex items-center justify-center shadow">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">{step.title}</h3>
                <p className="text-[#6B7280] leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 5. Benefits                                                       */
/* ---------------------------------------------------------------- */
const benefits = [
  {
    icon: Zap,
    title: 'Fast Response',
    description:
      'Get connected to a local HVAC tech quickly — when your AC or heat is out, every minute counts.',
    color: 'bg-orange-50 text-[#F97316]',
  },
  {
    icon: UserCheck,
    title: 'Vetted Technicians',
    description:
      'Every HVAC professional in our network is background-checked and licensed in their state.',
    color: 'bg-blue-50 text-[#1E3A8A]',
  },
  {
    icon: BarChart3,
    title: 'All Makes & Models',
    description:
      "Whether it's a central AC, mini-split, gas furnace, or heat pump — our techs handle it all.",
    color: 'bg-green-50 text-emerald-600',
  },
];

function HvacBenefits() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] tracking-tight mb-3">
            Why Choose NeighborCoverage for HVAC?
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Vetted, licensed HVAC professionals in your area — with neighborly service and
            no obligation to connect.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="group relative bg-[#F9FAFB] rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${benefit.color} mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">{benefit.title}</h3>
                <p className="text-[#6B7280] leading-relaxed">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 6. Image Feature Section                                          */
/* ---------------------------------------------------------------- */
const featureBullets = [
  'Licensed technicians covering your area',
  'Residential & commercial HVAC service',
  'AC repair, furnace service & heat pump specialists',
  'Emergency same-day appointments available',
  'No cost to connect with a local technician',
];

function HvacFeature() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#F9FAFB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <Image
                src="/images/home-exterior.jpg"
                alt="Well-maintained home with comfortable HVAC system"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/30 to-transparent" />
            </div>
          </motion.div>

          {/* Right - Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 text-[#1E3A8A] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>Vetted. Licensed. Local.</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E3A8A] leading-tight tracking-tight mb-5">
              Stay Comfortable <span className="text-[#F97316]">Year-Round</span>
            </h2>

            <p className="text-lg text-[#374151] mb-8 leading-relaxed">
              From summer heat waves to winter cold snaps, NeighborCoverage connects you with
              trusted HVAC pros who keep your home running smoothly — no matter the season.
            </p>

            <ul className="space-y-4 mb-8">
              {featureBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#F97316] flex-shrink-0 mt-0.5" />
                  <span className="text-[#374151] text-base md:text-lg">{bullet}</span>
                </li>
              ))}
            </ul>

            <HvacCTA location="hvac_feature" variant="orange" size="lg" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 7. Orange Mid-CTA Banner                                          */
/* ---------------------------------------------------------------- */
const midBadges = [
  { icon: ShieldCheck, text: 'No Obligation' },
  { icon: Award, text: 'Licensed Technicians' },
  { icon: Clock, text: 'Same-Day Available' },
];

function HvacMiddleCTA() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#F97316] to-[#FB923C]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-white/90 text-sm md:text-base font-semibold uppercase tracking-wider mb-3">
            HVAC Specialists Standing By
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Don&apos;t Suffer Through the Heat — or the Cold.
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            One call connects you with a local HVAC pro ready to help today.
          </p>

          <div className="mb-8">
            <HvacCTA location="hvac_middle_cta" variant="white" size="xl" />
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {midBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-white/90"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{badge.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 8. Navy Bottom CTA                                                */
/* ---------------------------------------------------------------- */
function HvacBottomCTA() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Wind className="w-12 h-12 text-[#F97316] mx-auto mb-6" />

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Your Comfort Is Our Priority
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-4 max-w-2xl mx-auto">
            Fast, reliable HVAC help from vetted local technicians — brought to you by your
            neighbors at NeighborCoverage.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/80 mb-10">
            <CheckCircle className="w-5 h-5 text-[#F97316]" />
            <span>Local Experts. Vetted Service. No Obligation.</span>
          </div>

          <HvacCTA location="hvac_bottom_cta" variant="orange" size="xl" />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 9. Footer                                                         */
/* ---------------------------------------------------------------- */
function HvacFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E3A8A] text-white py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#F97316]" fill="#F97316" strokeWidth={0} />
            <div>
              <span className="text-xl font-bold">NeighborCoverage</span>
              <p className="text-white/60 text-sm">Expert Advice, Neighborly Service</p>
            </div>
          </div>

          <div className="flex gap-6 text-sm text-white/70">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center text-white/50 text-xs max-w-3xl mx-auto space-y-2">
            <p>
              NeighborCoverage connects you with licensed, vetted HVAC professionals.
              Service availability and pricing vary by location and individual circumstances.
              Not all services available in all areas.
            </p>
            <p>© {currentYear} NeighborCoverage. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- */
/* 10. Mobile Sticky CTA                                             */
/* ---------------------------------------------------------------- */
function HvacMobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible((window?.scrollY ?? 0) > 200);
    window?.addEventListener?.('scroll', handleScroll);
    return () => window?.removeEventListener?.('scroll', handleScroll);
  }, []);

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
          data-cta-location="hvac_sticky"
          className="flex items-center justify-center gap-3 text-white font-bold text-lg"
        >
          <Phone className="w-5 h-5 animate-pulse-ring" />
          <span>CALL NOW: {PHONE_DISPLAY}</span>
        </a>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Page composition                                                 */
/* ---------------------------------------------------------------- */
export function HvacContent() {
  return (
    <main className="min-h-screen bg-white">
      <HvacHeader />
      <HvacHero />
      <HvacTrust />
      <HvacHowItWorks />
      <HvacBenefits />
      <HvacFeature />
      <HvacMiddleCTA />
      <HvacBottomCTA />
      <HvacFooter />
      <HvacMobileStickyCTA />
    </main>
  );
}
