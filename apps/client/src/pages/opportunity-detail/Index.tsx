import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { opportunityData } from "@/data/opportunities";
import { useOpportunities } from "@/hooks/useOpportunities";
import { DetailHero } from "./sections/DetailHero";
import { DetailOverview } from "./sections/DetailOverview";
import { LocalityGrid } from "./sections/LocalityGrid";
import { InterestForm } from "./sections/InterestForm";

export function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isPending, isError } = useOpportunities();

  const pool = data && data.length > 0 ? data : opportunityData;
  const opportunity = pool.find((item) => item.slug === slug);

  if (!opportunity && isPending) {
    return (
      <SiteLayout>
        <section className="section">
          <div className="shell">
            <p className="eyebrow">Loading opportunity…</p>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (!opportunity) {
    return (
      <SiteLayout>
        <section className="section">
          <div className="shell">
            <p className="eyebrow">Opportunity not found</p>
            <h1>This opportunity isn&rsquo;t available.</h1>
            <p>
              {isError
                ? "We couldn't reach the opportunities service. Please try again shortly."
                : "It may have been closed or moved. Explore the current set of curated opportunities instead."}
            </p>
            <Link to="/home-ownership-opportunities" className="button button--gold">
              View all opportunities <ArrowRight size={16} />
            </Link>
          </div>
        </section>
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
