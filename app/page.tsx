import { StickyHeader } from '@/components/sticky-header';
import { HeroSection } from '@/components/hero-section';
import { BenefitsSection } from '@/components/benefits-section';
import { AutoInsuranceSection } from '@/components/auto-insurance-section';
import { HomeInsuranceSection } from '@/components/home-insurance-section';
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
      <AutoInsuranceSection />
      <HomeInsuranceSection />
      <MiddleCTASection />
      <TrustSection />
      <HowItWorksSection />
      <BottomCTASection />
      <FooterSection />
      <MobileStickyCTA />
    </main>
  );
}
