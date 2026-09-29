import { useParams } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { NotFoundPage } from "@/pages/not-found/Index";
import { useOpportunity } from "@/data/useOpportunities";
import { DetailHero } from "./sections/DetailHero";
import { DetailOverview } from "./sections/DetailOverview";
import { LocalityGrid } from "./sections/LocalityGrid";
import { InterestForm } from "./sections/InterestForm";

export function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { opportunity, status } = useOpportunity(slug);

  // An unpublished, removed or mistyped slug is a real 404, not a reason to
  // show a different property as if it were the one requested -- the previous
  // version fell back to opportunityData[0], which meant a stale or wrong
  // link silently showed a visitor a home they never asked about.
  if (status === "empty" || status === "unavailable") {
    return <NotFoundPage />;
  }

  if (status === "loading" || !opportunity) {
    return (
      <SiteLayout>
        <div className="section shell" style={{ padding: "96px 0", textAlign: "center" }}>
          <p style={{ color: "var(--axp-grey)" }}>Loading…</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <DetailHero opportunity={opportunity} />
      <DetailOverview opportunity={opportunity} />
      <LocalityGrid />
      <InterestForm />
    </SiteLayout>
  );
}
