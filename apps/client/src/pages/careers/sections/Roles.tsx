import "./Roles.css";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Handshake } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function Roles() {
  return (
    <section className="section roles-section">
      <div className="shell">
        <SectionHeading eyebrow="Opportunities" title="Future ways to contribute." />
        <div className="roles-grid">
          <article><GraduationCap /><h3>Early careers</h3><p>Future opportunities may support learning across housing, research, customer experience and programme support.</p></article>
          <article><BriefcaseBusiness /><h3>Open roles</h3><p>Approved roles will be published with clear responsibilities and selection criteria.</p></article>
          <article><Handshake /><h3>Specialist collaboration</h3><p>Experienced professionals may start a general conversation about future project-based collaboration.</p><Link to="/work-with-axp">Work with AXP <ArrowRight size={15} /></Link></article>
        </div>
      </div>
    </section>
  );
}
