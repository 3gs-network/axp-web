import "./Reasons.css";
import { Check } from "lucide-react";

const reasons = [
  "Reach people through a clearer, more responsible experience",
  "Support better-informed homeownership and finance conversations",
  "Contribute to accessible and sustainable urban-living outcomes",
  "Build trust through transparent communication and realistic expectations",
];

export function Reasons() {
  return (
    <section className="section section--alabaster">
      <div className="shell work-reasons-grid">
        <div><p className="eyebrow">Why work with AXP</p><h2 className="display-heading">Keep people, confidence and long-term value in view.</h2><p>AXP brings a customer-first perspective to homeownership and urban-living conversations. We focus on clarity, responsible communication and practical outcomes.</p></div>
        <div className="work-reasons-list">{reasons.map((reason) => { const [lead, ...rest] = reason.split(" "); return <div key={reason}><Check aria-hidden="true" /><span><strong>{lead}</strong> {rest.join(" ")}</span></div>; })}</div>
      </div>
    </section>
  );
}
