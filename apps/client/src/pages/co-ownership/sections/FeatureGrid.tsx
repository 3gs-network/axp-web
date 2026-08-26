import "./FeatureGrid.css";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const features = [
  { t: "Proportionate Ownership", d: "Your recorded ownership position reflects qualifying equity acquired under the scheme." },
  { t: "Income Participation", d: "Where distributable rental income exists, eligible members participate according to qualifying ownership percentage." },
  { t: "Progressive Equity", d: "Additional qualifying contributions can increase your ownership position over time." },
  { t: "Liquidity Options", d: "Qualifying units may be transferable or tradeable where an approved mechanism exists." },
  { t: "Collateral Potential", d: "Qualifying interests may potentially support collateralisation where accepted by an approved financial institution." },
  { t: "Path to Full Ownership", d: "Members may staircase their ownership position towards 100%, where the property structure permits." },
];

export function FeatureGrid() {
  const reduce = useReducedMotion();
  return (
    <section className="section feature-grid-section section--navy">
      <div className="shell">
        <motion.div variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <SectionHeading light eyebrow="Key product features" title="Built around progressive ownership." />
        </motion.div>
        <motion.div className="feature-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {features.map(({ t, d }, index) => (
            <motion.article key={t} variants={staggerItem}>
              <span className="feature-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
