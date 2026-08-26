import "./VisitorPathways.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

const pathways = [
  { n: "02", t: "Who is AXP?", c: "Learn what AXP stands for and why our customer-first approach matters.", to: "/who-we-are" },
  { n: "03", t: "How can I prepare?", c: "Explore HomeReady™ and build confidence for your homeownership journey.", to: "/homeready" },
  { n: "04", t: "What should I know?", c: "Use practical guides and insights to make more informed housing decisions.", to: "/knowledge" },
  { n: "05", t: "Can my organisation collaborate?", c: "See who can work with AXP and start a straightforward conversation.", to: "/work-with-axp" },
];

export function VisitorPathways() {
  return (
    <section className="section platforms-section">
      <div className="shell">
        <SectionHeading eyebrow="Where do I start?" title="Choose the next step that fits your goal." copy="The AXP website is organised around the questions visitors are most likely to ask—from understanding who we are to exploring a home or starting a conversation." />
        <div className="platforms-grid">
          <Link to="/home-ownership-opportunities" className="platform-card platform-card--feature">
            <div className="platform-number">01</div><div><span className="platform-kicker">Core offering</span><h3>Explore opportunities</h3><p>See homeownership opportunities, locations and possible ownership pathways in one customer-friendly experience.</p></div><ArrowRight />
          </Link>
          {pathways.map((item) => <Link to={item.to} className="platform-card" key={item.n}><div className="platform-number">{item.n}</div><div><h3>{item.t}</h3><p>{item.c}</p></div><ArrowRight /></Link>)}
        </div>
      </div>
    </section>
  );
}
