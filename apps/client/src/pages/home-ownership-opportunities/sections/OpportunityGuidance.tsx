import "./OpportunityGuidance.css";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const readinessSteps = [
  "Understand your ownership readiness",
  "Explore pathways that suit your goals",
  "Connect to support once opportunities are approved",
];

export function OpportunityGuidance() {
  return (
    <section className="section section--navy opportunity-guidance">
      <div className="shell opportunity-guidance-grid">
        <div>
          <p className="eyebrow eyebrow--gold">The AXP difference</p>
          <h2>AXP is not selling houses. AXP is helping people own homes.</h2>
          <ul className="check-list">
            {readinessSteps.map((step) => (
              <li key={step}>
                <Check aria-hidden />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="opportunity-guidance-action">
          <Link to="/homeready" className="button button--gold">
            Start with HomeReady™ <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
