import { Phone } from 'lucide-react';

interface CTAButtonProps {
  location: string;
  variant?: 'orange' | 'white' | 'navy' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
  label?: string;
}

const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '000-000-0000';
const PHONE_TEL = `tel:${(PHONE_NUMBER ?? '').replace?.(/[^0-9]/g, '') ?? ''}`;

export function CTAButton({
  location = '',
  variant = 'orange',
  size = 'md',
  className = '',
  showIcon = true,
  label,
}: CTAButtonProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl md:text-2xl',
  };

  const variantClasses: Record<string, string> = {
    orange: 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-lg hover:shadow-xl',
    white: 'bg-white hover:bg-gray-50 text-[#1E3A8A] shadow-lg hover:shadow-xl',
    navy: 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-white shadow-lg hover:shadow-xl',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10',
  };

  return (
    <a
      href={PHONE_TEL}
      data-cta-location={location}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-bold
        transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
        ${sizeClasses?.[size] ?? sizeClasses.md}
        ${variantClasses?.[variant] ?? variantClasses.orange}
        ${className}
      `}
    >
      {showIcon && <Phone className="w-5 h-5 flex-shrink-0" />}
      <span>{label ?? `Call Now: ${PHONE_NUMBER}`}</span>
    </a>
  );
}
