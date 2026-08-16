import "./EquityProgress.css";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const milestones = [
  { t: "Initial Subscription", d: "Indicatively begin from 5% equity" },
  { t: "Progressive Contributions", d: "Build through scheduled contributions" },
  { t: "Initial Milestone", d: "Work towards approximately 40% equity" },
  { t: "Allocation / Participation", d: "Receive corresponding ownership interest" },
  { t: "Balance Funding", d: "Progressively fund the remaining position" },
  { t: "Additional Equity", d: "Acquire further eligible interests" },
  { t: "100% Ownership", d: "Or use an approved transfer or exit mechanism" },
];

export function EquityProgress() {
  const reduce = useReducedMotion();
  return (
    <section className="section equity-progress section--alabaster">
      <div className="shell">
        <motion.div variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <SectionHeading eyebrow="How ownership can progress" title="Start small. Build deliberately." />
        </motion.div>
        <motion.div className="equity-stepper" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {milestones.map((item, index) => {
            const isEnd = index === 0 || index === milestones.length - 1;
            return (
              <motion.div key={item.t} className={isEnd ? "equity-node equity-node--gold" : "equity-node"} variants={staggerItem}>
                <span className="equity-node-dot">{index + 1}</span>
                <strong>{item.t}</strong>
                <p>{item.d}</p>
              </motion.div>
            );
          })}
        </motion.div>
        <p className="equity-disclaimer">Percentages and timelines shown are indicative and may vary by property, scheme structure and participant eligibility.</p>
      </div>
    </section>
  );
}
