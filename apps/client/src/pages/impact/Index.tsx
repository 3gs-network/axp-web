import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Commitments } from "./sections/Commitments";
import { Evidence } from "./sections/Evidence";

export function ImpactPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Impact" title="Progress should be meaningful to people and communities." copy="AXP’s public impact commitments focus on confidence, preparation, opportunity access and long-term urban wellbeing." image="https://res.cloudinary.com/gxhmv4fu/image/upload/w_2400,c_limit,f_auto,q_auto/v1785720445/impact-hero-image_pjlbm9.jpg" breathe flip />
      <Commitments />
      <Evidence />
    </SiteLayout>
  );
}
