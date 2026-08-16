import "./FaqSection.css";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FAQ } from "@/components/shared/FAQ";
import { ArrowLink } from "@/components/shared/ArrowLink";

const items: [string, string][] = [
  ["Is Co-Ownership a mortgage?", "No. It is a structured property ownership and participation model. It does not itself constitute a mortgage or guarantee access to mortgage finance."],
  ["How much do I need to start?", "The current illustrative model provides for an initial subscription equivalent to 5% equity. Actual requirements may vary by property, scheme and participant eligibility."],
  ["Can I increase my ownership?", "Yes, subject to scheme rules. The model is designed to allow qualifying members to progressively increase their equity position."],
  ["Will I receive rental income?", "Where qualifying distributable rental income exists, eligible members may receive distributions proportionate to ownership after approved expenses. Income is not guaranteed."],
  ["Can I sell my units?", "Eligible ownership units may be transferable or tradeable where an approved mechanism exists and subject to scheme rules, legal restrictions and market conditions."],
  ["Can I eventually own 100%?", "The model is intended to provide a pathway to staircase towards full ownership where the relevant property and scheme permit it."],
];

export function FaqSection() {
  const reduce = useReducedMotion();
  return (
    <section className="section co-faq-section section--alabaster">
      <div className="shell">
        <motion.div className="split-heading" variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <SectionHeading eyebrow="FAQs" title="Start with the essentials." />
          <ArrowLink to="/contact">Talk to our team</ArrowLink>
        </motion.div>
        <FAQ items={items} />
      </div>
    </section>
  );
}
