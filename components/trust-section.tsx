'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, ShieldCheck, MapPin, ThumbsUp } from 'lucide-react';

const trustItems = [
  { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'text-[#F97316]' },
  { icon: ShieldCheck, value: 'Secure', label: 'Your information is protected', color: 'text-[#1E3A8A]' },
  { icon: MapPin, value: '50 States', label: 'Nationwide coverage', color: 'text-emerald-600' },
  { icon: ThumbsUp, value: 'No Obligation', label: 'Just honest advice', color: 'text-purple-600' },
];

export function TrustSection() {
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
            Trusted by Thousands of Drivers
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(trustItems ?? []).map((item: any, i: number) => {
            const Icon = item?.icon ?? Star;
            return (
              <motion.div
                key={item?.label ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 ${item?.color ?? ''}`} />
                <div className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-1">
                  {item?.value ?? ''}
                </div>
                <p className="text-[#6B7280] text-sm">{item?.label ?? ''}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
