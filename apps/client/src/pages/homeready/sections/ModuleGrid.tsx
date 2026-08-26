import "./ModuleGrid.css";
import { ArrowRight, BarChart3, FileText, GraduationCap, Target, WalletCards } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const modules = [
  { t: "Financial readiness", d: "Understand income, expenditure, savings and affordability in context", icon: WalletCards },
  { t: "Mortgage education", d: "Learn the core concepts and questions to consider before formal assessment", icon: GraduationCap },
  { t: "Homeownership guidance", d: "Make sense of the stages, decisions and documents that may sit ahead", icon: BarChart3 },
  { t: "Opportunity awareness", d: "Explore the kinds of locations, homes and ownership routes that may fit your goals", icon: FileText },
  { t: "Readiness planning", d: "Turn what you learn into a realistic sequence of next actions", icon: Target },
  { t: "Next-step guidance", d: "Know which question to ask and when a formal conversation may be appropriate", icon: ArrowRight },
];

export function ModuleGrid() {
  const reduce = useReducedMotion();
  return (
    <section className="section">
      <div className="shell">
        <motion.div variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <SectionHeading eyebrow="Practical support" title="Build confidence one practical step at a time." />
        </motion.div>
        <motion.div className="module-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {modules.map(({ t, d, icon: ModuleIcon }) => <motion.article key={t} variants={staggerItem}><ModuleIcon /><h3>{t}</h3><p>{d}</p></motion.article>)}
        </motion.div>
      </div>
    </section>
  );
}
