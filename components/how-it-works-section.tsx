'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Phone, MessageSquare, PiggyBank } from 'lucide-react';

const steps = [
  {
    icon: Phone,
    step: '1',
    title: 'Call Now',
    description: 'Speak with a licensed advisor',
  },
  {
    icon: MessageSquare,
    step: '2',
    title: 'Share Your Needs',
    description: 'Tell us about your vehicle and coverage preferences',
  },
  {
    icon: PiggyBank,
    step: '3',
    title: 'Compare & Save',
    description: 'Get personalized quotes from top carriers',
  },
];

export function HowItWorksSection() {
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
            Get Your Quote in 3 Simple Steps
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8">
          {(steps ?? []).map((step: any, i: number) => {
            const Icon = step?.icon ?? Phone;
            return (
              <motion.div
                key={step?.title ?? i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < (steps?.length ?? 0) - 1 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#1E3A8A]/20 to-[#F97316]/20" />
                )}
                
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] text-white mb-5 shadow-lg">
                  <Icon className="w-8 h-8" />
                  <span className="absolute -top-1 -right-1 w-7 h-7 bg-[#F97316] text-white text-sm font-bold rounded-full flex items-center justify-center shadow">
                    {step?.step ?? ''}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">{step?.title ?? ''}</h3>
                <p className="text-[#6B7280] leading-relaxed max-w-xs mx-auto">{step?.description ?? ''}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
