import "./JourneySection.css";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const steps = [
  { title: "Structure", label: "Foundation stage", copy: "An appropriate ownership vehicle is established. Scheme rules, governance arrangements and participation requirements are defined, and an approved property or property pool is identified." },
  { title: "Join", label: "Begin your position", copy: "Prospective members complete onboarding, identity verification and affordability/readiness review. The indicative model provides for an initial subscription equivalent to 5% equity." },
  { title: "Build", label: "Grow your equity", copy: "Members make scheduled contributions. Their ownership account is updated progressively as additional qualifying equity is acquired, building towards an indicative initial milestone of approximately 40%." },
  { title: "Acquire", label: "Formal ownership interest", copy: "At the relevant acquisition stage, the member receives corresponding co-ownership units or beneficial interest through the applicable SPV, trust or approved ownership structure." },
  { title: "Fund", label: "Complete your position", copy: "Where applicable, the remaining ownership balance can be funded progressively. The illustrative structure provides for the remaining 60% balance to be funded over approximately 5-7 years, potentially through structured lease-purchase payments." },
  { title: "Grow", label: "Expand and participate", copy: "Members may acquire additional ownership interests in defined increments, including indicative 5% tranches where permitted. Eligible net rental income may be allocated in proportion to ownership after approved expenses." },
  { title: "Realise", label: "Your path forward", copy: "Subject to scheme rules, legal structure and market conditions, eligible interests may support transfer, approved trading, collateralisation where accepted, unit sale, or progression towards 100% ownership." },
];

export function JourneySection() {
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();
  return (
    <section id="journey" className="section co-journey-section section--alabaster">
      <div className="shell">
        <motion.div variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <SectionHeading eyebrow="The Co-Ownership journey" title="Seven stages. One progressive path to ownership." copy="Select a stage to see how it works." />
        </motion.div>
        <motion.div className="co-journey-tabs" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {steps.map((item, index) => <motion.button key={item.title} variants={staggerItem} className={step === index ? "active" : ""} onClick={() => setStep(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</motion.button>)}
        </motion.div>
        <div className="co-journey-stage">
          <div className="co-journey-path" aria-hidden="true">
            <div className="co-journey-line"><i style={{ transform: `scaleX(${step / (steps.length - 1)})` }} /></div>
            {steps.map((item, index) => <div key={item.title} className={index <= step ? "co-journey-node reached" : "co-journey-node"}>{index < step ? <Check /> : index + 1}</div>)}
          </div>
          <div key={step} className="co-journey-stage-content"><p className="eyebrow">{steps[step].label}</p><h3>{steps[step].title}</h3><p>{steps[step].copy}</p></div>
          <ArrowRight />
        </div>
      </div>
    </section>
  );
}
