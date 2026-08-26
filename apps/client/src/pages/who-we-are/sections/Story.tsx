import "./Story.css";
import { motion, useReducedMotion } from "framer-motion";
import { SourceNote } from "@/components/shared/SourceNote";
import { fadeInUp } from "@/lib/motion";

export function Story() {
  const reduce = useReducedMotion();
  return (
    <section className="section">
      <motion.div className="shell story-grid" variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
        <div>
          <p className="eyebrow">Our purpose</p>
          <h2>Making Urban Living Possible.</h2>
          <div className="story-proof">
            <strong>70m</strong>
            <span>estimated housing-unit deficit across Africa is the gap AXP exists to help close</span>
            <SourceNote href="https://unhabitat.org/news/30-may-2025/united-nations-habitat-assembly-adopts-strategic-plan-2026-2029-to-advance-adequate-housing-for-all">UN-Habitat, 2025</SourceNote>
          </div>
        </div>
        <div className="story-copy">
          <p className="lead">AXP is not selling houses. AXP is helping people own homes.</p>
          <p>We believe people should be able to explore homeownership with clearer information, stronger preparation and greater confidence.</p>
          <p>Our public role is simple: help visitors understand their options, prepare for the journey and take an appropriate next step.</p>
        </div>
      </motion.div>
    </section>
  );
}
