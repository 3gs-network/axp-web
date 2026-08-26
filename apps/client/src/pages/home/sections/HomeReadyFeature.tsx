import "./HomeReadyFeature.css";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

export function HomeReadyFeature() {
  return (
    <section className="section homeready-feature">
      <div className="shell feature-split">
        <div className="feature-image-wrap"><img src="https://res.cloudinary.com/gxhmv4fu/image/upload/w_1200,c_limit,f_auto,q_auto/v1785537404/mortgage-application_qmxcll.jpg" alt="A young African couple reviewing a digital financial journey together" /><div className="floating-score"><span>Readiness pathway</span><strong>One clear next step</strong></div></div>
        <div className="feature-copy"><p className="eyebrow">HomeReady™</p><h2>Homeownership starts long before a mortgage application.</h2><p>HomeReady™ helps aspiring homeowners build useful knowledge, understand financial readiness and identify a practical path towards sustainable ownership.</p><ul className="check-list"><li><Check /> Understand your starting point</li><li><Check /> Build a personalised readiness plan</li><li><Check /> Progress through guided learning</li><li><Check /> Identify your most relevant next step</li></ul><Link to="/homeready" className="button button--primary">Experience HomeReady™ <ArrowRight size={16} /></Link></div>
      </div>
    </section>
  );
}
