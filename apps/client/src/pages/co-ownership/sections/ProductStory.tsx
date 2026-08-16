import "./ProductStory.css";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function ProductStory() {
  const reduce = useReducedMotion();
  return (
    <section className="section co-product-story">
      <motion.div className="shell co-story-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
        <motion.div className="co-story-headline" variants={staggerItem}><p className="eyebrow">What is Co-Ownership?</p><h2>Homeownership does not always have to begin with buying 100%.</h2></motion.div>
        <motion.div className="co-story-copy" variants={staggerItem}>
          <p className="lead">AXP Co-Ownership is a structured property participation model designed to make ownership more progressive.</p>
          <p>Rather than requiring a participant to acquire an entire property from the outset, eligible members can acquire an initial ownership interest in an approved property and progressively increase that interest over time.</p>
          <p>Ownership interests are structured and recorded through the applicable SPV, trust or other approved ownership structure, with participation governed by the relevant scheme documentation.</p>
          <ul className="co-story-pillars">
            <li>Structured</li>
            <li>Progressive</li>
            <li>Proportionate</li>
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
