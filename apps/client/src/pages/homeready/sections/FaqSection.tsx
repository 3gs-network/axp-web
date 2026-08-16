import "./FaqSection.css";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FAQ } from "@/components/shared/FAQ";
import { ArrowLink } from "@/components/shared/ArrowLink";

const items: [string, string][] = [
  ["Is HomeReady™ a mortgage lender?", "No. HomeReady™ is a guidance and preparation experience. Any formal finance decision would remain with an approved financial institution and be subject to its criteria."],
  ["Does a readiness score guarantee a mortgage?", "No. Readiness indicators support planning and education; they do not constitute an approval, offer or guarantee of finance."],
  ["Who is HomeReady™ for?", "It is designed for aspiring homeowners who want to understand the journey, improve their preparation and ask more informed questions."],
];

export function FaqSection() {
  const reduce = useReducedMotion();
  return (
    <section className="section faq-section section--alabaster">
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
