import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "./sections/Hero";
import { EventFlashCard } from "./sections/EventFlashCard";
import { FeaturedOpportunities } from "./sections/FeaturedOpportunities";
import { ChallengePanel } from "./sections/ChallengePanel";
import { PublicPromise } from "./sections/PublicPromise";
import { VisitorPathways } from "./sections/VisitorPathways";
import { HomeReadyFeature } from "./sections/HomeReadyFeature";
import { ImpactPreview } from "./sections/ImpactPreview";
import { KnowledgePreview } from "./sections/KnowledgePreview";
import { WorkWithAxpBand } from "./sections/WorkWithAxpBand";

export function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <EventFlashCard />
      <FeaturedOpportunities />
      <ChallengePanel />
      <PublicPromise />
      <VisitorPathways />
      <HomeReadyFeature />
      <ImpactPreview />
      <KnowledgePreview />
      <WorkWithAxpBand />
    </SiteLayout>
  );
}
