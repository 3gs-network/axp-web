import "./ContactBand.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function ContactBand() {
  return (
    <section className="section work-contact section--navy">
      <div className="shell work-contact-grid">
        <div><p className="eyebrow eyebrow--gold">Become a partner</p><h2 className="display-heading">Tell us what you would like to make possible.</h2><p>Whether you are exploring a first conversation or already have a specific idea, AXP welcomes organisations that share an interest in accessible homeownership and sustainable urban living.</p></div>
        <div className="work-contact-action"><Link to="/contact?route=Looking%20to%20Collaborate" className="button button--gold">Choose your contact route <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
