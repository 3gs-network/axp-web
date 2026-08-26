import "./Governance.css";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";

const commitments = [
  "Clear, responsible communication that respects your information",
  "No unverified availability claims",
  "Straightforward next steps",
];

export function Governance() {
  const reduce = useReducedMotion();
  return (
    <section className="section governance-section section--navy">
      <div className="shell governance-grid">
        <SectionHeading light eyebrow="Our public commitments" title="Trust begins with clarity." copy="AXP aims to make every public interaction responsible, understandable and honest." />
        <motion.div className="governance-list" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {commitments.map((item) => <motion.div key={item} variants={staggerItem}><ShieldCheck /><span>{item}</span></motion.div>)}
        </motion.div>
      </div>
    </section>
  );
}
