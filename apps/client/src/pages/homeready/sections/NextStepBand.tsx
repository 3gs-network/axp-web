import "./NextStepBand.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

export function NextStepBand() {
  const reduce = useReducedMotion();
  return (
    <section className="section next-step-band section--navy">
      <motion.div className="shell next-step-grid" variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
        <div>
          <p className="eyebrow eyebrow--gold">Your next step</p>
          <h2>Begin at a pace that works for you.</h2>
          <p>Register your interest and we'll be in touch as HomeReady™ opens — with guidance, financial readiness support and better-matched opportunities along the way.</p>
        </div>
        <div className="next-step-action">
          <Link to="/contact?route=Looking%20for%20a%20Home" className="button button--gold">Register interest <ArrowRight size={16} /></Link>
        </div>
      </motion.div>
    </section>
  );
}
