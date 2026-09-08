import "./InterestForm.css";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

/**
 * Register interest — an enquiry into the AXP mortgage lead queue.
 *
 * This was a disabled mock ("when this experience is live"). It is live now: it
 * posts through `/api/leads`, which is the site's own server, which holds the
 * CRM credentials. Nothing here talks to the CRM directly.
 *
 * The markup and class names are unchanged, so InterestForm.css still applies
 * exactly as before -- only the behaviour is new.
 */

const BUDGETS = [
  "Under ₦25m",
  "₦25m – ₦50m",
  "₦50m – ₦100m",
  "₦100m – ₦250m",
  "Over ₦250m"
];
const CONTACT_METHODS = ["Phone call", "WhatsApp", "Email"];
const TIMELINES = ["Within 3 months", "3 – 6 months", "6 – 12 months", "Just exploring"];

// The lower bound of the chosen range, so the advisor sees a number rather than
// nothing. It is an indication, not a quote -- the real figure comes from the
// fact find.
function budgetToAmount(budget: string): number {
  const match = budget.match(/(\d+)m/);
  return match ? Number(match[1]) * 1_000_000 : 0;
}

export function InterestForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    budget: "",
    contactMethod: "",
    timeline: "",
    website: "" // honeypot: a field a person never sees
  });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "sending") return;

    setState("sending");
    setMessage("");

    try {
      const response = await apiFetch("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          loanAmount: budgetToAmount(form.budget),
          interest: form.budget,
          message: [
            form.contactMethod && `Prefers ${form.contactMethod}.`,
            form.timeline && `Timeline: ${form.timeline}.`
          ]
            .filter(Boolean)
            .join(" "),
          website: form.website
        })
      });

      const payload = (await response.json()) as
        | { ok: true }
        | { ok: false; error: { message: string } };

      if (!response.ok || !payload.ok) {
        setState("error");
        // The server's message is written for the visitor; show it rather than
        // a generic apology, so a fixable mistake (a malformed email) can
        // actually be fixed.
        setMessage(
          !payload.ok
            ? payload.error.message
            : "We could not send that just now. Please try again shortly."
        );
        return;
      }

      setState("sent");
    } catch {
      setState("error");
      setMessage("We could not send that just now. Please try again shortly.");
    }
  };

  if (state === "sent") {
    return (
      <section className="section interest-concept">
        <div className="shell interest-grid">
          <div>
            <p className="eyebrow">Register interest</p>
            <h2>Thank you — we have your details.</h2>
            <p>
              A mortgage advisor will be in touch. If anything changes in the meantime,
              reply to the confirmation and it will reach the same person.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const busy = state === "sending";

  return (
    <section className="section interest-concept">
      <div className="shell interest-grid">
        <div>
          <p className="eyebrow">Register interest</p>
          <h2>Tell us where you are, and we’ll help you take the next step.</h2>
        </div>
        <form className="interest-form" onSubmit={submit}>
          <label>
            Name
            <input
              required
              value={form.fullName}
              onChange={(event) => set("fullName", event.target.value)}
              placeholder="Your name"
              disabled={busy}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => set("email", event.target.value)}
              placeholder="you@example.com"
              disabled={busy}
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => set("phone", event.target.value)}
              placeholder="Your phone number"
              disabled={busy}
            />
          </label>
          <label>
            Budget
            <select value={form.budget} onChange={(event) => set("budget", event.target.value)} disabled={busy}>
              <option value="">Select a range</option>
              {BUDGETS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preferred contact method
            <select
              value={form.contactMethod}
              onChange={(event) => set("contactMethod", event.target.value)}
              disabled={busy}
            >
              <option value="">Select a preference</option>
              {CONTACT_METHODS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Timeline
            <select value={form.timeline} onChange={(event) => set("timeline", event.target.value)} disabled={busy}>
              <option value="">Select a timeline</option>
              {TIMELINES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {/* Hidden from people, irresistible to bots. Off-screen rather than
              display:none, which some bots skip. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(event) => set("website", event.target.value)}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
          />

          {state === "error" && message && (
            <p role="alert" style={{ gridColumn: "1 / -1", margin: 0, color: "#b3261e" }}>
              {message}
            </p>
          )}

          <button className="button button--primary" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Register interest"}
          </button>
        </form>
      </div>
    </section>
  );
}
