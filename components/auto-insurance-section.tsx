'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Car, ShieldCheck, Umbrella, Wrench, Users, CheckCircle } from 'lucide-react';
import { CTAButton } from './cta-button';

const coverages = [
  { icon: Car, title: 'Liability & Collision', description: 'Protection for accidents, damage, and third-party claims.' },
  { icon: Umbrella, title: 'Comprehensive', description: 'Theft, weather, vandalism, and the unexpected — covered.' },
  { icon: Wrench, title: 'Roadside & Rental', description: 'Towing, labor, and a rental car when you need it most.' },
  { icon: Users, title: 'Uninsured Motorist', description: "Stay protected even when the other driver isn't." },
];

export function AutoInsuranceSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="auto-insurance" ref={ref} className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Subtle brand accent */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#1E3A8A] to-[#F97316]" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <Image
                src="/images/auto-red-car.jpg"
                alt="Sleek car parked on a city street, ready for the road"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/40 via-transparent to-transparent" />
              {/* Floating stat card */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
                <div className="text-2xl font-bold text-[#1E3A8A]">Save up to 35%</div>
                <div className="text-xs text-[#6B7280]">by comparing top auto carriers</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 text-[#1E3A8A] px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-5">
              <Car className="w-4 h-4" />
              <span>Auto Insurance</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E3A8A] tracking-tight leading-[1.1] mb-4">
              Drive Confident,{' '}
              <span className="text-[#F97316]">Covered for Every Mile</span>
            </h2>

            <p className="text-lg text-[#374151] leading-relaxed mb-8 max-w-lg">
              From your daily commute to the family road trip, get the right coverage at the
              right price. One quick call connects you with a licensed advisor who shops top
              carriers on your behalf.
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
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 text-[#F97316]">
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
              <CheckCircle className="w-5 h-5 text-[#F97316]" />
              <span>Free quotes • No obligation • Licensed advisors</span>
            </div>

            <CTAButton location="auto_insurance_section" variant="navy" size="lg" label="Get My Auto Quote" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
