import "./Hero.css";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Building2, Handshake, Landmark } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

const focusAreas = [
  { icon: Building2, label: "Property developers" },
  { icon: Landmark, label: "Financial institutions" },
  { icon: BriefcaseBusiness, label: "Employers & communities" },
];

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="work-hero">
      <motion.div className="shell work-hero-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible">
        <motion.div variants={staggerItem}>
          <p className="eyebrow eyebrow--gold">Work with AXP</p>
          <h1>Can your organisation help make homeownership more possible?</h1>
          <p>AXP welcomes purposeful conversations with organisations that share an interest in accessible homeownership, informed customers and sustainable urban living.</p>
          <div className="button-row">
            <Link to="/contact?route=Looking%20to%20Collaborate" className="button button--gold">Become a partner <ArrowRight size={16} aria-hidden="true" /></Link>
            <button type="button" className="button button--glass" onClick={() => document.getElementById("collaboration-audiences")?.scrollIntoView({ behavior: "smooth" })}>See who we work with</button>
          </div>
        </motion.div>
        <motion.div className="work-hero-card" variants={staggerItem}>
          <div className="work-hero-card-header"><Handshake size={16} aria-hidden="true" /><span>Organisations we&rsquo;re built for</span></div>
          <ul className="work-hero-card-list">
            {focusAreas.map(({ icon: Icon, label }) => <li key={label}><Icon size={16} aria-hidden="true" /><span>{label}</span></li>)}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
