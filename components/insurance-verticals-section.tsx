'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ShieldCheck, Car, Home, HeartPulse, Flower2 } from 'lucide-react';
import { VerticalCard, type VerticalCardData } from './vertical-card';

const insurance: VerticalCardData[] = [
  {
    icon: Car,
    category: 'Auto',
    title: 'Auto Insurance',
    copy: 'Compare top carriers in one call and drive covered for every mile — liability, collision, comprehensive, and roadside, all at the right price.',
    image: '/images/auto-red-car.jpg',
    alt: 'Sleek car parked on a city street, ready for the road',
    accent: 'bg-orange-50 text-[#F97316]',
    badge: 'bg-[#F97316]',
  },
  {
    icon: Home,
    category: 'Home',
    title: 'Home Insurance',
    copy: 'Protect the place you call home. Dwelling, personal property, liability, and disaster coverage — with bundle discounts when you add auto.',
    image: '/images/home-exterior.jpg',
    alt: 'Charming suburban home at dusk with warm lights on',
    accent: 'bg-emerald-50 text-emerald-700',
    badge: 'bg-emerald-600',
  },
  {
    icon: HeartPulse,
    category: 'Medicare',
    title: 'Medicare Plans',
    copy: 'Turning 65 or reviewing your plan? A licensed advisor helps you compare Medicare Advantage and Supplement options built around your health.',
    image: '/images/medicare.jpg',
    alt: 'Happy senior enjoying life, confident in her health coverage',
    accent: 'bg-sky-50 text-sky-700',
    badge: 'bg-sky-600',
  },
  {
    icon: Flower2,
    category: 'Final Expense',
    title: 'Final Expense Life',
    copy: 'Give your family peace of mind. Affordable whole-life coverage that helps handle funeral costs and final bills — simple approval, lasting protection.',
    image: '/images/final-expense.jpg',
    alt: 'Elderly couple embracing outdoors, secure about the future',
    accent: 'bg-indigo-50 text-indigo-700',
    badge: 'bg-indigo-600',
  },
];

export function InsuranceVerticalsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="insurance" ref={ref} className="py-16 md:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 text-[#1E3A8A] px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Insurance</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E3A8A] tracking-tight mb-3">
            Coverage for Life&apos;s Biggest Things
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Car, home, health, and legacy — protect what matters most with expert, neighborly
            guidance and rates shopped across trusted carriers.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {insurance.map((data, i) => (
            <VerticalCard key={data.title} data={data} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
