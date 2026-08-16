import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductHero } from "./sections/ProductHero";
import { ProductStory } from "./sections/ProductStory";
import { JourneySection } from "./sections/JourneySection";
import { FeatureGrid } from "./sections/FeatureGrid";
import { EquityProgress } from "./sections/EquityProgress";
import { Ecosystem } from "./sections/Ecosystem";
import { FaqSection } from "./sections/FaqSection";
import { NextStepBand } from "./sections/NextStepBand";

export function CoOwnershipPage() {
  return (
    <SiteLayout>
      <ProductHero />
      <ProductStory />
      <JourneySection />
      <FeatureGrid />
      <EquityProgress />
      <Ecosystem />
      <FaqSection />
      <NextStepBand />
    </SiteLayout>
  );
}
