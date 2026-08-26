import "./JourneySection.css";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const steps = [
  { title: "Discover", copy: "Understand the ownership journey and what lenders typically consider.", label: "Start with clarity" },
  { title: "Assess", copy: "Build a structured view of financial and mortgage readiness.", label: "Know your position" },
  { title: "Plan", copy: "Receive a personalised roadmap with practical next actions.", label: "Create your pathway" },
  { title: "Build", copy: "Progress through learning, financial preparation and document readiness.", label: "Improve over time" },
  { title: "Next step", copy: "Identify the most relevant conversation or action when you feel ready to move forward.", label: "Move with confidence" },
];

export function JourneySection() {
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();
  return (
    <section id="journey" className="section journey-section section--alabaster">
      <div className="shell">
        <motion.div variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <SectionHeading eyebrow="Interactive journey" title="Five stages. One visible path forward." copy="Select a stage to preview the customer experience." />
        </motion.div>
        <motion.div className="journey-tabs" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {steps.map((item, index) => <motion.button key={item.title} variants={staggerItem} className={step === index ? "active" : ""} onClick={() => setStep(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</motion.button>)}
        </motion.div>
        <div className="journey-stage">
          <div className="journey-path" aria-hidden="true">
            <div className="journey-line"><i style={{ transform: `scaleX(${step * 0.25})` }} /></div>
            {steps.map((item, index) => <div key={item.title} className={index <= step ? "journey-node reached" : "journey-node"}>{index < step ? <Check /> : index + 1}</div>)}
          </div>
          <div key={step} className="journey-stage-content"><p className="eyebrow">{steps[step].label}</p><h3>{steps[step].title}</h3><p>{steps[step].copy}</p></div>
          <ArrowRight />
        </div>
      </div>
    </section>
  );
}
