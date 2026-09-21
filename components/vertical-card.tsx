'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface VerticalCardData {
  icon: LucideIcon;
  category: string;
  title: string;
  copy: string;
  image: string;
  alt: string;
  /** Tailwind classes for the icon chip, e.g. 'bg-orange-50 text-[#F97316]' */
  accent: string;
  /** Tailwind classes for the category badge, e.g. 'bg-orange-500' */
  badge: string;
}

interface VerticalCardProps {
  data: VerticalCardData;
  index: number;
  inView: boolean;
}

export function VerticalCard({ data, index, inView }: VerticalCardProps) {
  const Icon = data.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: (index % 4) * 0.08 + 0.05, duration: 0.5 }}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={data.image}
          alt={data.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 ${data.badge} text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg`}
        >
          {data.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${data.accent} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </span>
          <h3 className="text-lg md:text-xl font-bold text-[#1E3A8A] leading-tight tracking-tight">
            {data.title}
          </h3>
        </div>

        <p className="text-[#6B7280] text-sm leading-relaxed mb-5 flex-1">{data.copy}</p>

        <span className="inline-flex items-center gap-1.5 text-[#F97316] font-bold text-sm group-hover:gap-2.5 transition-all">
          Get a free quote
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </motion.article>
  );
}
