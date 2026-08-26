import "./ImpactPreview.css";
import { ShieldCheck, Users, Building2, GraduationCap, Map as MapIcon } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ArrowLink } from "@/components/shared/ArrowLink";

const impactAreas = [
  { name: "Customer confidence", icon: ShieldCheck, note: "People better equipped to understand their choices" },
  { name: "Homeownership readiness", icon: Users, note: "Aspiring homeowners with a clearer next step" },
  { name: "Opportunity access", icon: Building2, note: "More understandable routes to explore a home" },
  { name: "Useful knowledge", icon: GraduationCap, note: "Practical guidance for better-informed decisions" },
  { name: "Urban wellbeing", icon: MapIcon, note: "Long-term value for people and places" },
];

export function ImpactPreview() {
  return (
    <section className="section impact-preview section--alabaster">
      <div className="shell">
        <div className="split-heading"><SectionHeading eyebrow="Our intended impact" title="Progress should be meaningful to people and communities." copy="AXP is focused on practical outcomes: greater confidence, stronger readiness, clearer opportunities and more inclusive urban-living possibilities." /></div>
        <div className="impact-framework">
          {impactAreas.map(({ name, icon: Icon, note }, i) => <article key={name} className={`impact-frame impact-frame--${i + 1}`}><Icon /><span>{name}</span><p>{note}</p></article>)}
        </div>
        <ArrowLink to="/impact">Explore AXP’s impact commitments</ArrowLink>
      </div>
    </section>
  );
}
