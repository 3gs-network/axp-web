import "./NextStepBand.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

export function NextStepBand() {
  const reduce = useReducedMotion();
  return (
    <section className="section co-next-step-band section--navy">
      <motion.div className="shell co-next-step-grid" variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
        <div>
          <p className="eyebrow eyebrow--gold">Your next step</p>
          <h2>Start with the ownership position that works for you.</h2>
          <p>Explore available Co-Ownership opportunities and understand how progressive property ownership could work for your circumstances.</p>
        </div>
        <div className="co-next-step-action">
          <Link to="/home-ownership-opportunities" className="button button--gold">Explore Co-Ownership <ArrowRight size={16} /></Link>
          <Link to="/contact" className="button button--glass">Talk to our team</Link>
        </div>
      </motion.div>
    </section>
  );
}
