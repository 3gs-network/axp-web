import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Portal } from "./sections/Portal";
import { Calculator } from "./sections/Calculator";
import { ReadyIqBand } from "./sections/ReadyIqBand";
import { Downloads } from "./sections/Downloads";

export function KnowledgePage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Knowledge Centre" title="Clear guidance for more confident housing decisions." copy="Explore practical homeownership education, market perspectives and useful tools for people and organisations considering Africa’s urban future." />
      <Portal />
      <Calculator />
      <ReadyIqBand />
      <Downloads />
    </SiteLayout>
  );
}
