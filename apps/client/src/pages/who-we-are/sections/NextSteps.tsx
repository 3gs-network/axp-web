import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { fadeInUp } from "@/lib/motion";

export function NextSteps() {
  const reduce = useReducedMotion();
  return (
    <section className="section section--alabaster">
      <motion.div className="shell feature-split" variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
        <SectionHeading eyebrow="Where this leads" title="Two ways to move forward." copy="Whether you're preparing for homeownership or exploring a partnership that expands it, AXP has a clear next step for you." />
        <div className="button-row"><Link to="/home-ownership-opportunities" className="button button--primary">Explore opportunities <ArrowRight size={16} /></Link><Link to="/work-with-axp" className="button button--outline">Partner with AXP <ArrowRight size={16} /></Link></div>
      </motion.div>
    </section>
  );
}
