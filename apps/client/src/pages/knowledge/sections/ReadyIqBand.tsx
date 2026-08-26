import "./ReadyIqBand.css";
import type { CSSProperties } from "react";
import { Gauge } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

const signals = [
  { l: "Knowledge", v: 70 },
  { l: "Savings", v: 45 },
  { l: "Documents", v: 60 },
  { l: "Affordability", v: 38 },
];

export function ReadyIqBand() {
  const reduce = useReducedMotion();
  return (
    <section className="section readyiq-band">
      <div className="shell readyiq-grid">
        <motion.div variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <span className="product-badge"><Gauge size={15} /> ReadyIQ™</span>
          <h2>Use simple readiness signals to plan your next step.</h2>
          <p>ReadyIQ™ is a self-reflection tool designed to help an aspiring homeowner think about knowledge, savings, documents and affordability before a formal conversation.</p>
        </motion.div>
        <div className="readyiq-divider" aria-hidden="true" />
        <motion.div className="insight-widget" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <div className="widget-head"><span>Your preparation areas</span></div>
          <div className="signal-grid">
            {signals.map((x) => (
              <motion.div className="signal-tile" key={x.l} variants={staggerItem}>
                <div className="signal-ring" style={{ "--v": x.v } as CSSProperties}>
                  <span>{x.v}%</span>
                </div>
                <p>{x.l}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
