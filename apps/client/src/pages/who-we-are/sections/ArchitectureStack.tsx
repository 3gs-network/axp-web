import { useRef } from "react";
import "./ArchitectureStack.css";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const stages = [
  { n: "01", t: "Understand", d: "Learn who AXP is and what we stand for" },
  { n: "02", t: "Explore", d: "Review homeownership opportunities" },
  { n: "03", t: "Prepare", d: "Build readiness through HomeReady™ guidance" },
  { n: "04", t: "Connect", d: "Start a straightforward conversation with AXP" },
];

const dotVariants = {
  rest: { backgroundColor: "#F5F3ED", borderColor: "rgba(26,35,61,.2)", color: "#1A233D" },
  active: { backgroundColor: "#D4A02A", borderColor: "#D4A02A", color: "#0e172c" },
};

export function ArchitectureStack() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start center", "end center"] });
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 1 });

  return (
    <section className="section architecture-section">
      <div className="shell">
        <SectionHeading eyebrow="What visitors can expect" title="A practical, visitor-first experience." copy="Every public AXP journey is designed to answer a useful question without exposing unnecessary complexity." />
        <div className="architecture-track" ref={trackRef}>
          <div className="architecture-rail" />
          <motion.div className="architecture-rail-progress" style={{ scaleY: reduce ? 1 : progress }} />
          {stages.map((item) => (
            <div className="architecture-node" key={item.n}>
              <motion.span
                className="architecture-dot"
                initial={reduce ? "active" : "rest"}
                whileInView="active"
                viewport={{ once: true, amount: 0.8 }}
                variants={dotVariants}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 35 }}
              >
                {item.n}
              </motion.span>
              <div>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
