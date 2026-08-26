import "./Commitments.css";
import { Building2, GraduationCap, Map as MapIcon, ShieldCheck, Users } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

const impactAreas = [
  { name: "Customer confidence", icon: ShieldCheck, note: "People feel better equipped to consider their choices" },
  { name: "Readiness", icon: Users, note: "Aspiring homeowners can identify a practical next step" },
  { name: "Opportunity access", icon: Building2, note: "Homeownership possibilities are explained clearly and responsibly" },
  { name: "Useful knowledge", icon: GraduationCap, note: "Guidance supports more informed housing decisions" },
  { name: "Urban wellbeing", icon: MapIcon, note: "Housing choices keep people, place and long-term value in view" },
];

export function Commitments() {
  return (
    <section className="section impact-preview">
      <div className="shell">
        <div className="split-heading"><SectionHeading eyebrow="What impact means to AXP" title="Focus on outcomes people can understand." copy="These are AXP’s intended areas of contribution." /></div>
        <div className="impact-framework">
          {impactAreas.map(({ name, icon: Icon, note }, index) => <article key={name} className={`impact-frame impact-frame--${index + 1}`}><Icon /><span>{name}</span><p>{note}</p></article>)}
        </div>
      </div>
    </section>
  );
}
