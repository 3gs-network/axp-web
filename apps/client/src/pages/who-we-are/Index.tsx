import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "./sections/Hero";
import { Story } from "./sections/Story";
import { PurposeGrid } from "./sections/PurposeGrid";
import { ArchitectureStack } from "./sections/ArchitectureStack";
import { Governance } from "./sections/Governance";
import { Team } from "./sections/Team";
import { TestimonialsPartners } from "./sections/TestimonialsPartners";
import { NextSteps } from "./sections/NextSteps";

export function WhoWeArePage() {
  return (
    <SiteLayout>
      <Hero />
      <Story />
      <PurposeGrid />
      <ArchitectureStack />
      <Governance />
      <Team />
      <TestimonialsPartners />
      <NextSteps />
    </SiteLayout>
  );
}
