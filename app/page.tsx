import { StickyHeader } from '@/components/sticky-header';
import { HeroSection } from '@/components/hero-section';
import { BenefitsSection } from '@/components/benefits-section';
import { MiddleCTASection } from '@/components/middle-cta-section';
import { TrustSection } from '@/components/trust-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { BottomCTASection } from '@/components/bottom-cta-section';
import { FooterSection } from '@/components/footer-section';
import { MobileStickyCTA } from '@/components/mobile-sticky-cta';

export default function Home() {
  return (
    <main className="min-h-screen">
      <StickyHeader />
      <HeroSection />
      <BenefitsSection />
      <MiddleCTASection />
      <TrustSection />
      <HowItWorksSection />
      <BottomCTASection />
      <FooterSection />
      <MobileStickyCTA />
    </main>
  );
}
