import "./Evidence.css";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

export function Evidence() {
  return (
    <section className="section section--alabaster impact-evidence">
      <div className="shell feature-split">
        <div><img src="/images/homeready_people_2.png" alt="People considering a future homeownership journey" /></div>
        <div className="feature-copy">
          <p className="eyebrow">Evidence before claims</p>
          <h2>Report only what can be supported.</h2>
          <p>As approved programmes and opportunities develop, AXP intends to communicate progress with clear definitions, appropriate evidence and honest context.</p>
          <ul className="check-list"><li><Check /> Separate commitments from verified results</li><li><Check /> Explain what each future measure means</li><li><Check /> Avoid implying outcomes that have not been confirmed</li></ul>
          <Link to="/knowledge" className="button button--primary">Explore the Knowledge Centre <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
