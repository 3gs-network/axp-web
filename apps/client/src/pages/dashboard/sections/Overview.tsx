import "./Overview.css";
import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, Layers } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

const cards = [
  {
    icon: KeyRound,
    eyebrow: "HomeReady™ overview",
    stat: "68%",
    statLabel: "Readiness score",
    progress: 68,
    caption: "Financial readiness · Mortgage education · Document readiness",
    to: "/homeready",
    cta: "Continue HomeReady™",
  },
  {
    icon: Layers,
    eyebrow: "Co-Ownership overview",
    stat: "32%",
    statLabel: "Equity built",
    progress: 32,
    caption: "Structure → Join → Build (you are here) → Acquire",
    to: "/co-ownership",
    cta: "View Co-Ownership",
  },
];

export function Overview() {
  return (
    <section className="section dashboard-overview">
      <div className="shell">
        <SectionHeading eyebrow="Your journey" title="Track your homeownership progress." copy="This is an example preview of what your dashboard will show. Live progress tracking is on its way." />
        <div className="dashboard-cards">
          {cards.map(({ icon: Icon, eyebrow, stat, statLabel, progress, caption, to, cta }) => (
            <article key={eyebrow} className="dashboard-card">
              <div className="dashboard-card-head">
                <Icon aria-hidden />
                <span>{eyebrow}</span>
                <span className="dashboard-card-tag">Example preview</span>
              </div>
              <div className="dashboard-card-stat">
                <strong>{stat}</strong>
                <span>{statLabel}</span>
              </div>
              <div className="dashboard-card-progress"><i style={{ width: `${progress}%` }} /></div>
              <p>{caption}</p>
              <Link to={to} className="dashboard-card-link">{cta} <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
