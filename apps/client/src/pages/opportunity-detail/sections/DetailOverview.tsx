import "./DetailOverview.css";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Opportunity } from "@/data/opportunities";

export function DetailOverview({ opportunity }: { opportunity: Opportunity }) {
  return (
    <section className="section">
      <div className="shell opportunity-detail-grid">
        <div>
          <SectionHeading eyebrow="Overview" title="A more considered ownership journey." copy={opportunity.overview} />
          <div className="detail-feature-grid">
            <article><span>Key features</span><strong>{opportunity.bedrooms}</strong><strong>{opportunity.bathrooms}</strong><strong>{opportunity.parking}</strong></article>
            <article><span>Ownership options</span><strong>Mortgage</strong><strong>Outright purchase</strong><strong>Flexible payment plan</strong></article>
          </div>
        </div>
        <aside className="selection-note">
          <p className="eyebrow">Why this opportunity?</p>
          <h3>Considered through an AXP lens.</h3>
          <p>This opportunity highlights the qualities people may weigh when exploring a homeownership pathway: accessibility, location, everyday living and long-term possibility.</p>
        </aside>
      </div>
    </section>
  );
}
