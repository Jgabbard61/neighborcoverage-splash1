'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Home, Flame, Droplets, KeyRound, Gem, CheckCircle } from 'lucide-react';
import { CTAButton } from './cta-button';

const coverages = [
  { icon: Home, title: 'Dwelling Protection', description: 'Rebuild or repair your home after covered damage.' },
  { icon: Flame, title: 'Fire & Disaster', description: 'Coverage for fire, storms, and unexpected disasters.' },
  { icon: Gem, title: 'Personal Property', description: 'Your belongings protected — inside and out.' },
  { icon: Droplets, title: 'Liability & Water', description: 'Guard against accidents, leaks, and legal claims.' },
];

export function HomeInsuranceSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="home-insurance" ref={ref} className="relative py-16 md:py-24 overflow-hidden">
      {/* Distinct warm/emerald background for its own identity */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50/40" />
      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-emerald-600 to-[#1E3A8A]" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-600/10 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-5">
              <Home className="w-4 h-4" />
              <span>Home Insurance</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E3A8A] tracking-tight leading-[1.1] mb-4">
              Protect the Place{' '}
              <span className="text-emerald-600">You Call Home</span>
            </h2>

            <p className="text-lg text-[#374151] leading-relaxed mb-8 max-w-lg">
              Your home is your biggest investment — and your family&apos;s safe haven. Get
              homeowners coverage that shields your house, your belongings, and your peace of
              mind, all backed by neighborly, expert guidance.
            </p>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              {coverages.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] mb-0.5">{c.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-snug">{c.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[#1E3A8A] font-medium mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Bundle with auto &amp; save even more</span>
            </div>

            <CTAButton location="home_insurance_section" variant="navy" size="lg" label="Get My Home Quote" />
          </motion.div>

          {/* Right - Image stack */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <Image
                src="/images/home-exterior.jpg"
                alt="Charming suburban home at dusk with warm lights on"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
            </div>

            {/* Overlapping detail image (distinct keys photo) */}
            <div className="hidden sm:block absolute -bottom-8 -left-8 w-40 h-40 rounded-xl overflow-hidden shadow-2xl ring-4 ring-white">
              <Image
                src="/images/home-keys.jpg"
                alt="Hand holding house keys — welcome home"
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>

            {/* Floating stat card */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
              <div className="text-2xl font-bold text-emerald-700">Bundle &amp; Save</div>
              <div className="text-xs text-[#6B7280]">home + auto discounts</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
