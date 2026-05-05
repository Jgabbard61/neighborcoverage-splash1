'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, CheckCircle } from 'lucide-react';
import { CTAButton } from './cta-button';

export function BottomCTASection() {
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
          <Shield className="w-12 h-12 text-[#F97316] mx-auto mb-6" />
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Protecting What Matters
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-4 max-w-2xl mx-auto">
            The Coverage Your Home & Auto Deserve, From Your Neighbors at NeighborCoverage
          </p>
          <div className="flex items-center justify-center gap-2 text-white/80 mb-10">
            <CheckCircle className="w-5 h-5 text-[#F97316]" />
            <span>Local Care, Comprehensive Coverage</span>
          </div>

          <CTAButton location="bottom_cta_section" variant="orange" size="xl" />
        </motion.div>
      </div>
    </section>
  );
}
