import "./RegisterFlow.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { registerInterest } from "@/lib/homeready";
import { readUtm } from "@/lib/utm";
import { CodeStep } from "./CodeStep";
import { DetailsForm, EMPTY_DETAILS, type DetailsValues } from "./DetailsForm";

type Step =
  | { kind: "details"; notice?: string }
  | { kind: "code"; pendingId: string; email: string; resendAfterSeconds: number }
  | { kind: "done"; name: string };

/**
 * The right half of /register: details -> emailed code -> confirmation.
 * Nothing is saved as a lead until the code is confirmed (see
 * routes/homeready.route.ts).
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
    const result = await registerInterest({ ...details, ...readUtm() });
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
    <main className="register-main">
      <div className="register-panel">
        {step.kind === "details" && (
          <>
            <h1>Register your interest</h1>
            <p className="register-lead">Takes about a minute. A HomeReady officer will be in touch.</p>
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
          <div className="register-done">
            <CheckCircle2 className="register-done-icon" aria-hidden />
            <h1 ref={doneRef} tabIndex={-1}>
              Thanks{step.name ? `, ${step.name}` : ""}.
            </h1>
            <p className="register-lead">We've received your details and an HomeReady officer will contact you shortly.</p>
            <Link to="/homeready" className="button button--primary">
              Learn more about HomeReady
            </Link>
          </div>
        )}
      </div>

      <Link to="/" className="register-back">
        <ArrowLeft size={14} aria-hidden /> Back to homepage
      </Link>
    </main>
  );
}
