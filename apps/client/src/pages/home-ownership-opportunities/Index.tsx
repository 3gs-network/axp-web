import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { OpportunitySearch } from "./sections/OpportunitySearch";
import { OpportunityGuidance } from "./sections/OpportunityGuidance";

export function HomeOwnershipOpportunitiesPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Home ownership opportunities" title="Find a pathway that feels possible." copy="AXP presents curated opportunities to help people explore the kinds of homes, locations and ownership routes that may fit their goals." image="https://res.cloudinary.com/gxhmv4fu/image/upload/w_2400,c_limit,f_auto,q_auto/v1785642190/home-ownership-hero-image_b2hfyj.jpg" imagePosition="62% center" breathe />
      <OpportunitySearch />
      <OpportunityGuidance />
    </SiteLayout>
  );
}
