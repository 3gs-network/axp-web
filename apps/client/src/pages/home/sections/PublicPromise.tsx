import "./PublicPromise.css";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ArrowLink } from "@/components/shared/ArrowLink";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function PublicPromise() {
  return (
    <section className="section public-promise-section">
      <div className="shell public-promise-grid">
        <div>
          <SectionHeading eyebrow="What AXP offers" title="A clearer way to explore homeownership and urban living." copy="AXP helps individuals and organisations unlock homeownership and urban-living opportunities through useful guidance, carefully presented opportunities and straightforward conversations." />
          <ArrowLink to="/who-we-are">Discover who AXP is</ArrowLink>
        </div>
        <div className="public-promise-cards">
          <article><span>01</span><h3>Explore opportunities</h3><p>Review homeownership opportunities and the kinds of ownership routes that may fit your goals.</p><Link to="/home-ownership-opportunities">View opportunities <ArrowRight size={15} /></Link></article>
          <article><span>02</span><h3>Prepare with confidence</h3><p>Use HomeReady™ to understand the journey, build readiness and identify a practical next step.</p><Link to="/homeready">Explore HomeReady™ <ArrowRight size={15} /></Link></article>
        </div>
      </div>
    </section>
  );
}
