'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Wrench, HardHat, Wind, Bug, Bath, AppWindow, Hammer } from 'lucide-react';
import { VerticalCard, type VerticalCardData } from './vertical-card';

const services: VerticalCardData[] = [
  {
    icon: Wrench,
    category: 'Plumbing',
    title: 'Plumbing Service',
    copy: 'Leaks, clogs, water heaters, and emergencies — get a licensed plumber fast, with upfront pricing and workmanship you can trust.',
    image: '/images/plumbing.jpg',
    alt: 'Professional plumber repairing pipes under a kitchen sink',
    accent: 'bg-blue-50 text-blue-700',
    badge: 'bg-blue-600',
  },
  {
    icon: HardHat,
    category: 'Roofing',
    title: 'Roofing Install & Repair',
    copy: 'From storm damage to full replacements, connect with vetted roofers who protect your home from the top down — free inspections available.',
    image: '/images/roofing.jpg',
    alt: 'Roofers installing new shingles on a home against a blue sky',
    accent: 'bg-orange-50 text-[#F97316]',
    badge: 'bg-[#F97316]',
  },
  {
    icon: Wind,
    category: 'HVAC',
    title: 'HVAC Install & Repair',
    copy: 'Stay comfortable year-round. Fast AC and heating repairs plus efficient new-system installs from certified technicians near you.',
    image: '/images/hvac.jpg',
    alt: 'HVAC technician servicing an outdoor air conditioning unit',
    accent: 'bg-cyan-50 text-cyan-700',
    badge: 'bg-cyan-600',
  },
  {
    icon: Bug,
    category: 'Pest Control',
    title: 'Pest Control',
    copy: 'Reclaim your home from bugs and rodents. Safe, effective treatments and ongoing prevention plans from trusted local pros.',
    image: '/images/pest-control.jpg',
    alt: 'Pest control specialist treating a yard with fogging equipment',
    accent: 'bg-emerald-50 text-emerald-700',
    badge: 'bg-emerald-600',
  },
  {
    icon: Bath,
    category: 'Remodeling',
    title: 'Bathroom Remodels',
    copy: 'Transform your bathroom into a spa-like retreat. Modern designs, quality fixtures, and dependable crews — one quote away.',
    image: '/images/bathroom-remodel.jpg',
    alt: 'Beautifully remodeled modern bathroom with double vanity',
    accent: 'bg-violet-50 text-violet-700',
    badge: 'bg-violet-600',
  },
  {
    icon: AppWindow,
    category: 'Windows',
    title: 'Window Installs',
    copy: 'Boost curb appeal and cut energy bills with new, energy-efficient windows — professionally measured and installed to last.',
    image: '/images/window-install.jpg',
    alt: 'Installer fitting a new energy-efficient window in a home',
    accent: 'bg-amber-50 text-amber-700',
    badge: 'bg-amber-600',
  },
];

export function HomeServicesSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="home-services" ref={ref} className="relative py-16 md:py-24 overflow-hidden">
      {/* Distinct soft background to separate from the insurance block */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F9FAFB] to-blue-50/40" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#F97316]/10 text-[#F97316] px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            <Hammer className="w-4 h-4" />
            <span>Home Services</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E3A8A] tracking-tight mb-3">
            Trusted Pros for Every Project
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            One neighbor, every job around the house — we connect you with licensed, vetted
            professionals who get it done right.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {services.map((data, i) => (
            <VerticalCard key={data.title} data={data} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
