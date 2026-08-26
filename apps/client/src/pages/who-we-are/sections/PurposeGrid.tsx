import "./PurposeGrid.css";
import { motion, useReducedMotion } from "framer-motion";
import { Target, Lightbulb, Globe2 } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

const items = [
  { Icon: Target, label: "Vision", copy: "An Africa where sustainable homeownership is within reach and urban living supports long-term prosperity." },
  { Icon: Lightbulb, label: "Mission", copy: "To make the path from aspiration to informed homeownership more understandable, accessible and trusted." },
  { Icon: Globe2, label: "Promise", copy: "To communicate clearly, present opportunities responsibly and keep people’s confidence at the centre." },
];

export function PurposeGrid() {
  const reduce = useReducedMotion();
  return (
    <section className="section section--alabaster">
      <div className="shell">
        <motion.div className="purpose-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {items.map(({ Icon, label, copy }) => (
            <motion.article key={label} variants={staggerItem}><Icon /><span>{label}</span><h3>{copy}</h3></motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
