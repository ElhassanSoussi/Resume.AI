import { BeforeAfterSection } from "@/components/marketing/before-after-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PricingPreviewSection } from "@/components/marketing/pricing-preview-section";
import { ProductOutcomesSection } from "@/components/marketing/product-outcomes-section";
import { TemplateShowcaseSection } from "@/components/marketing/template-showcase-section";
import { LANDING_FAQ } from "@/components/marketing/content/marketing-copy";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProductOutcomesSection />
      <BeforeAfterSection />
      <HowItWorksSection />
      <TemplateShowcaseSection />
      <PricingPreviewSection />
      <FaqSection
        items={LANDING_FAQ}
        subtitle="Straight answers — no fake reviews, no invented statistics. If something is not live yet, we say so."
      />
      <CtaSection />
    </>
  );
}
