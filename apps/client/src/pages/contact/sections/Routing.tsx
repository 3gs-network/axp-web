import "./Routing.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { staggerContainer, staggerItem } from "@/lib/motion";

const routes = ["Looking for a Home", "A Homeowner", "Interested in a Mortgage", "A Property Developer", "An Investor", "A Financial Institution", "Looking to Collaborate", "Others"];

const routeDetail: Record<string, string> = {
  "Looking for a Home": "Explore homeownership opportunities",
  "A Homeowner": "Explore how to unlock equity or value from your home",
  "Interested in a Mortgage": "Learn about mortgage readiness",
  "A Property Developer": "Discuss presenting an approved opportunity",
  "An Investor": "Discuss urban-living opportunities",
  "A Financial Institution": "Discuss expanding mortgage access",
  Government: "Discuss public-interest urban living",
  "Looking to Collaborate": "Start a collaboration conversation",
  Others: "Tell us what's on your mind, we're listening",
};

const panelTransition = { type: "spring" as const, stiffness: 300, damping: 32 };

export function Routing() {
  const location = useLocation();
  const initialRoute = useMemo(() => new URLSearchParams(location.search).get("route") || "", [location.search]);
  const [selected, setSelected] = useState(initialRoute);
  useEffect(() => setSelected(initialRoute), [initialRoute]);
  const reduce = useReducedMotion();

  return (
    <section className="section contact-routing">
      <div className="shell">
        <div className="route-question">
          <span>I am…</span>
          <motion.div className="route-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {routes.map((route) => (
              <motion.button className={selected === route ? "active" : ""} onClick={() => setSelected(route)} key={route} variants={staggerItem}>
                {route}<ChevronRight />
              </motion.button>
            ))}
          </motion.div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.div
              key={selected}
              className="route-result"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? {} : { opacity: 0, y: -14 }}
              transition={panelTransition}
            >
              <span>Your next step</span>
              <h2>{routeDetail[selected]}</h2>
              <div className="route-form-preview">
                <label><span>Email</span><input placeholder="you@example.com" disabled /></label>
                <label><span>What would you like to discuss?</span><textarea placeholder="Briefly describe your question" disabled /></label>
                <button className="button button--primary" disabled>Continue</button>
                <p className="route-form-note">
                  Direct submission is on its way. For now, <a href="mailto:info@axplimited.com"><Mail size={13} /> email us</a> or <a href="https://wa.me/+2349026211153" target="_blank" rel="noreferrer"><FaWhatsapp size={13} /> message us on WhatsApp</a>.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="route-empty"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? {} : { opacity: 0, y: -14 }}
              transition={panelTransition}
            >
              <ArrowRight /><h2>Select the description closest to you.</h2><p>Your suggested next step will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
