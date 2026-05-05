'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Phone, ShieldCheck, Gift, Award } from 'lucide-react';
import { CTAButton } from './cta-button';

const badges = [
  { icon: ShieldCheck, text: 'No Obligation' },
  { icon: Gift, text: 'Free Quotes' },
  { icon: Award, text: 'Licensed Advisors' },
];

export function MiddleCTASection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="relative py-16 md:py-20 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F97316] to-[#FB923C]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-white/90 text-sm md:text-base font-semibold uppercase tracking-wider mb-3">
            Advisors Standing By
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Get Covered. Call Your Neighbors Today.
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            We&apos;ve Got Your Back, With True Neighborly Care
          </p>

          <div className="mb-8">
            <CTAButton location="middle_cta_section" variant="white" size="xl" />
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {(badges ?? []).map((badge: any, i: number) => {
              const Icon = badge?.icon ?? ShieldCheck;
              return (
                <motion.div
                  key={badge?.text ?? i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-white/90"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{badge?.text ?? ''}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
