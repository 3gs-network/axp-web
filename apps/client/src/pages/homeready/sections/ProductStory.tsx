import "./ProductStory.css";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function ProductStory() {
  const reduce = useReducedMotion();
  return (
    <section className="section product-story">
      <motion.div className="shell story-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
        <motion.div className="story-headline" variants={staggerItem}><p className="eyebrow">What is HomeReady™?</p><h2>Readiness is a journey—not a pass or fail.</h2></motion.div>
        <motion.div className="story-copy" variants={staggerItem}>
          <p className="lead">HomeReady™ is a guided preparation experience for aspiring homeowners.</p>
          <p>It helps people understand the financial, documentary and practical foundations of mortgage readiness, then identify a realistic next step without suggesting that finance or a home is guaranteed.</p>
          <ul className="story-pillars">
            <li>Financial</li>
            <li>Documentary</li>
            <li>Practical</li>
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
