import "./ProductHero.css";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

const pillars = ["Progressive ownership", "Proportionate participation", "Income distribution", "Path to full ownership"];

export function ProductHero() {
  const reduce = useReducedMotion();
  return (
    <section className="co-product-hero">
      <motion.div className="shell co-product-hero-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible">
        <motion.div variants={staggerItem}>
          <span className="co-product-badge"><Sparkles size={15} /> AXP homeownership opportunities</span>
          <h1>Co-Ownership</h1>
          <h2>Own progressively. Participate from the start.</h2>
          <p>A structured pathway that enables members to acquire an interest in property progressively, build their ownership position over time and participate in the economic benefits associated with their share.</p>
          <div className="button-row">
            <button className="button button--gold" onClick={() => document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" })}>Explore Co-Ownership <ArrowRight size={16} /></button>
            <Link to="/contact" className="button button--glass">Talk to our team</Link>
          </div>
        </motion.div>
        <motion.div className="co-ledger-card" variants={staggerItem}>
          <div className="co-ledger-card-header"><Sparkles size={16} /><span>Co-Ownership is built around</span></div>
          <ul className="check-list">
            {pillars.map((item) => <li key={item}><Check size={16} /> {item}</li>)}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
