'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Zap, BarChart3, UserCheck } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: 'Fast & Easy',
    description: 'Get connected to a licensed advisor in seconds',
    color: 'bg-orange-50 text-[#F97316]',
  },
  {
    icon: BarChart3,
    title: 'Compare Options',
    description: 'Access multiple carriers to find your best rate',
    color: 'bg-blue-50 text-[#1E3A8A]',
  },
  {
    icon: UserCheck,
    title: 'Expert Guidance',
    description: 'Speak with experienced insurance professionals',
    color: 'bg-green-50 text-emerald-600',
  },
];

export function BenefitsSection() {
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
            Why Choose NeighborCoverage?
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Simple solutions with neighborly support every step of the way.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {(benefits ?? []).map((benefit: any, i: number) => {
            const Icon = benefit?.icon ?? Zap;
            return (
              <motion.div
                key={benefit?.title ?? i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="group relative bg-[#F9FAFB] rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${benefit?.color ?? 'bg-gray-50'} mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">{benefit?.title ?? ''}</h3>
                <p className="text-[#6B7280] leading-relaxed">{benefit?.description ?? ''}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
