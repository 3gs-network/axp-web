import "./Routing.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { apiFetch } from "@/lib/api";

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

  // The enquiry itself. It goes to /api/leads -- the same queue the Register
  // Interest form feeds -- so an advisor picks it up in the CRM rather than
  // somebody watching an inbox. The route the visitor chose travels with it,
  // because "I am a Property Developer" is the most useful thing on the form.
  const [form, setForm] = useState({ fullName: "", email: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Changing who you are starts a fresh enquiry rather than carrying a sent
  // state across, which would look like the new one had already gone.
  useEffect(() => {
    setState("idle");
    setError("");
  }, [selected]);

  const submitEnquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");

    try {
      const response = await apiFetch("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          message: form.message,
          interest: selected,
          website: form.website
        })
      });
      const payload = (await response.json()) as
        | { ok: true }
        | { ok: false; error: { message: string } };

      if (!response.ok || !payload.ok) {
        setState("error");
        setError(!payload.ok ? payload.error.message : "We could not send that just now.");
        return;
      }
      setState("sent");
    } catch {
      setState("error");
      setError("We could not send that just now. Please try again shortly.");
    }
  };

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
              {state === "sent" ? (
                <div className="route-form-preview">
                  <p className="route-form-note">
                    <strong>Thank you — we have your enquiry.</strong> An advisor will be in
                    touch. If it is urgent, <a href="https://wa.me/+2349026211153" target="_blank" rel="noreferrer"><FaWhatsapp size={13} /> message us on WhatsApp</a>.
                  </p>
                </div>
              ) : (
                <form className="route-form-preview" onSubmit={submitEnquiry}>
                  <label><span>Name</span><input required value={form.fullName} onChange={(event) => set("fullName", event.target.value)} placeholder="Your name" disabled={state === "sending"} /></label>
                  <label><span>Email</span><input required type="email" value={form.email} onChange={(event) => set("email", event.target.value)} placeholder="you@example.com" disabled={state === "sending"} /></label>
                  <label><span>What would you like to discuss?</span><textarea value={form.message} onChange={(event) => set("message", event.target.value)} placeholder="Briefly describe your question" disabled={state === "sending"} /></label>
                  {/* Hidden from people, filled in by bots. Off-screen rather
                      than display:none, which some bots skip. */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(event) => set("website", event.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }} />
                  {state === "error" && error && <p className="route-form-note" role="alert" style={{ color: "#b3261e" }}>{error}</p>}
                  <button className="button button--primary" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Continue"}</button>
                  <p className="route-form-note">
                    Prefer another way? <a href="mailto:info@axplimited.com"><Mail size={13} /> email us</a> or <a href="https://wa.me/+2349026211153" target="_blank" rel="noreferrer"><FaWhatsapp size={13} /> message us on WhatsApp</a>.
                  </p>
                </form>
              )}
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
