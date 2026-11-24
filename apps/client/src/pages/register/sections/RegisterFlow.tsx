import "./RegisterFlow.css";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { registerInterest } from "@/lib/homeready";
import { readUtm } from "@/lib/utm";
import { CodeStep } from "./CodeStep";
import { DetailsForm, EMPTY_DETAILS, type DetailsValues } from "./DetailsForm";

type Step =
  | { kind: "details"; notice?: string }
  | { kind: "code"; pendingId: string; email: string; resendAfterSeconds: number }
  | { kind: "done"; name: string };

/**
 * HomeReady sign-up: details -> emailed code -> confirmation. Nothing is
 * saved as a lead until the code is confirmed (see routes/homeready.route.ts).
 */
export function RegisterFlow() {
  const [step, setStep] = useState<Step>({ kind: "details" });
  const [values, setValues] = useState<DetailsValues>(EMPTY_DETAILS);
  const [submitting, setSubmitting] = useState(false);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step.kind === "done") doneRef.current?.focus();
  }, [step.kind]);

  const submitDetails = async (details: DetailsValues) => {
    setSubmitting(true);
    const utm = readUtm();
    const result = await registerInterest({ ...details, ...utm });
    setSubmitting(false);

    if (result.ok) {
      setStep({
        kind: "code",
        pendingId: result.data.pendingId,
        email: details.email.trim().toLowerCase(),
        resendAfterSeconds: result.data.resendAfterSeconds
      });
      return;
    }
    return { fields: result.error.fields, message: result.error.fields ? undefined : result.error.message };
  };

  return (
    <section className="section register-section">
      <div className="shell register-shell">
        <div className="register-card">
          {step.kind === "details" && (
            <>
              <h2>Your details</h2>
              <p>It takes about a minute. We'll email you a code to confirm your address, then a HomeReady officer will be in touch.</p>
              <DetailsForm
                values={values}
                onChange={setValues}
                onSubmit={submitDetails}
                submitting={submitting}
                notice={step.notice}
              />
            </>
          )}

          {step.kind === "code" && (
            <CodeStep
              key={step.pendingId}
              pendingId={step.pendingId}
              email={step.email}
              resendAfterSeconds={step.resendAfterSeconds}
              onVerified={(name) => setStep({ kind: "done", name })}
              onRestart={(notice) => setStep({ kind: "details", notice })}
            />
          )}

          {step.kind === "done" && (
            <div className="register-step register-done">
              <CheckCircle2 className="register-done-icon" aria-hidden />
              <h2 ref={doneRef} tabIndex={-1}>
                Thanks{step.name ? `, ${step.name}` : ""}.
              </h2>
              <p>We've received your details and an HomeReady officer will contact you shortly.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
