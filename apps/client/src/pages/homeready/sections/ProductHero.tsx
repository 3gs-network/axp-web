import "./ProductHero.css";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function ProductHero() {
  const reduce = useReducedMotion();
  return (
    <section className="product-hero">
      <motion.div className="shell product-hero-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible">
        <motion.div variants={staggerItem}>
          <span className="product-badge"><Sparkles size={15} /> AXP homeownership journey</span>
          <h1>HomeReady<span>™</span></h1>
          <h2>Your Journey to Homeownership Starts Here.</h2>
          <p>Build confidence through guidance, financial readiness, mortgage education and better-matched opportunities—at a pace that works for you.</p>
          <div className="button-row"><Link to="/contact?route=Looking%20for%20a%20Home" className="button button--gold">Register interest <ArrowRight size={16} /></Link><button className="button button--glass" onClick={() => document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button></div>
        </motion.div>
        <motion.div className="ledger-card" variants={staggerItem}>
          <div className="ledger-card-header"><Sparkles size={16} /><span>HomeReady™ guidance covers</span></div>
          <ul className="check-list">
            <li><Check size={16} /> Financial readiness</li>
            <li><Check size={16} /> Mortgage education</li>
            <li><Check size={16} /> Document readiness</li>
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
