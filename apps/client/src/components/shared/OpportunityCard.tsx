import "./OpportunityCard.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";

export function OpportunityCard({ opportunity, compact = false }: { opportunity: Opportunity; compact?: boolean }) {
  return <article className={`opportunity-card ${compact ? "opportunity-card--compact" : ""}`}>
    <div className="opportunity-card-image"><img src={opportunity.image} alt={opportunity.headline} /></div>
    <div className="opportunity-card-body"><p className="opportunity-location">{opportunity.location}</p><h3>{opportunity.headline}</h3><p className="opportunity-title">{opportunity.title}</p><strong>{opportunity.price}</strong><div className="opportunity-tags">{opportunity.tags.slice(0, compact ? 2 : 3).map((tag) => <span key={tag}>{tag}</span>)}</div>{!compact && <div className="opportunity-specs"><span>{opportunity.bedrooms}</span><span>{opportunity.bathrooms}</span><span>{opportunity.parking}</span></div>}<Link to={`/opportunities/${opportunity.slug}`} className="arrow-link">View opportunity <ArrowRight size={16} /></Link></div>
  </article>;
}
