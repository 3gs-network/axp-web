import "./Downloads.css";
import { BookOpen, Compass, FileText, ListChecks } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const resources = [
  { type: "Guide", format: "PDF", title: "Homeownership preparation guide", desc: "A structured guide to getting mortgage-ready, step by step.", icon: FileText },
  { type: "Checklist", format: "PDF", title: "Mortgage questions checklist", desc: "The questions worth asking before a lender conversation.", icon: ListChecks },
  { type: "Perspective", format: "Article", title: "Urban living perspective", desc: "A closer look at how Africa’s cities are reshaping housing demand.", icon: Compass },
  { type: "Overview", format: "PDF", title: "HomeReady™ overview", desc: "What the HomeReady™ programme covers and who it suits.", icon: BookOpen },
];

export function Downloads() {
  const reduce = useReducedMotion();
  return (
    <section className="section download-section section--alabaster">
      <div className="shell">
        <SectionHeading eyebrow="Resource library" title="Practical materials for future release." />
        <motion.div className="download-list" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {resources.map(({ type, format, title, desc, icon: Icon }) => (
            <motion.article key={title} variants={staggerItem}>
              <Icon />
              <div>
                <span className="download-type">{type}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
              <span className="download-format">{format}</span>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
