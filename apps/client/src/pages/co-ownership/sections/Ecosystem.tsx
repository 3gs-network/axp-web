import "./Ecosystem.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const products = [
  { stage: "Prepare", title: "HomeReady™", copy: "Guidance and preparation that helps aspiring homeowners understand financial, documentary and practical readiness.", to: "/homeready" },
  { stage: "Participate & Build", title: "Co-Ownership", copy: "A structured ownership pathway through which eligible participants can progressively acquire an interest in property.", to: "/co-ownership" },
];

const flow = ["Understand", "Prepare", "Participate", "Build", "Own"];

export function Ecosystem() {
  const reduce = useReducedMotion();
  return (
    <section className="section ecosystem-section section--navy">
      <div className="shell">
        <motion.div variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <SectionHeading light eyebrow="One AXP homeownership ecosystem" title="Different products. One homeownership journey." />
        </motion.div>
        <motion.div className="ecosystem-cards" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {products.map((item) => (
            <motion.div key={item.title} variants={staggerItem}>
              <Link to={item.to} className="ecosystem-card">
                <span className="eyebrow">{item.stage}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <span className="ecosystem-card-link">Learn more <ArrowRight size={15} /></span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <div className="ecosystem-flow">
          {flow.map((step, index) => (
            <span key={step}>
              {step}
              {index < flow.length - 1 && <ArrowRight size={13} aria-hidden />}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
