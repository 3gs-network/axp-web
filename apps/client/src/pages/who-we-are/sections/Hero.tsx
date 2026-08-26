import "./Hero.css";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="who-hero">
      <img className="who-hero-bg" src="/images/african_city.jpg" alt="" />
      <div className="who-hero-scrim" />
      <div className="shell who-hero-inner">
        <motion.div variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible">
          <motion.p className="eyebrow eyebrow--gold" variants={staggerItem}>Who we are</motion.p>
          <motion.h1 variants={staggerItem}>Helping make homeownership feel more possible.</motion.h1>
          <motion.p className="who-hero-lead" variants={staggerItem}>AXP helps individuals and organisations unlock homeownership and urban-living opportunities through trusted guidance, practical preparation and clearer next steps.</motion.p>
          <motion.div className="button-row" variants={staggerItem}>
            <Link to="/home-ownership-opportunities" className="button button--gold">Explore opportunities <ArrowRight size={16} /></Link>
            <Link to="/work-with-axp" className="button button--ghost-light">Partner with AXP</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
