import { StickyHeader } from '@/components/sticky-header';
import { HeroSection } from '@/components/hero-section';
import { InsuranceVerticalsSection } from '@/components/insurance-verticals-section';
import { HomeServicesSection } from '@/components/home-services-section';
import { MiddleCTASection } from '@/components/middle-cta-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { BenefitsSection } from '@/components/benefits-section';
import { TrustSection } from '@/components/trust-section';
import { BottomCTASection } from '@/components/bottom-cta-section';
import { FooterSection } from '@/components/footer-section';
import { MobileStickyCTA } from '@/components/mobile-sticky-cta';

export default function Home() {
  return (
    <main className="min-h-screen">
      <StickyHeader />
      <HeroSection />
      <InsuranceVerticalsSection />
      <HomeServicesSection />
      <MiddleCTASection />
      <HowItWorksSection />
      <BenefitsSection />
      <TrustSection />
      <BottomCTASection />
      <FooterSection />
      <MobileStickyCTA />
    </main>
  );
}
