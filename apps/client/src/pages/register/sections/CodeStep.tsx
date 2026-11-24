import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { OTP_LENGTH } from "@repo/shared/homeready";
import { resendCode, verifyCode } from "@/lib/homeready";

type Props = {
  pendingId: string;
  email: string;
  resendAfterSeconds: number;
  onVerified: (name: string) => void;
  /** The sign-up timed out or the person wants to change their details. */
  onRestart: (notice?: string) => void;
};

/**
 * Step 2: the 6-digit code from the email. One plain numeric input (with
 * autocomplete="one-time-code") rather than six boxes -- simpler for screen
 * readers, paste and phone autofill alike.
 */
export function CodeStep({ pendingId, email, resendAfterSeconds, onVerified, onRestart }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [waitUntil, setWaitUntil] = useState(() => Date.now() + resendAfterSeconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (now >= waitUntil) return;
    const timer = window.setTimeout(() => setNow(Date.now()), 1000);
    return () => window.clearTimeout(timer);
  }, [now, waitUntil]);

  const secondsLeft = Math.max(0, Math.ceil((waitUntil - now) / 1000));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const digits = code.replace(/\s/g, "");
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(digits)) {
      setError(`Please enter the ${OTP_LENGTH}-digit code from the email.`);
      inputRef.current?.focus();
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");
    const result = await verifyCode(pendingId, digits);
    setBusy(false);

    if (result.ok) {
      onVerified(result.data.name);
      return;
    }
    if (result.error.code === "SIGNUP_NOT_FOUND") {
      onRestart(result.error.message);
      return;
    }
    setError(result.error.message);
    inputRef.current?.focus();
  };

  const resend = async () => {
    if (busy || secondsLeft > 0) return;
    setBusy(true);
    setError("");
    setStatus("");
    const result = await resendCode(pendingId);
    setBusy(false);

    if (result.ok) {
      setCode("");
      setStatus(`We've sent a new code to ${email}. Earlier codes no longer work.`);
      setWaitUntil(Date.now() + result.data.resendAfterSeconds * 1000);
      setNow(Date.now());
      inputRef.current?.focus();
      return;
    }
    if (result.error.code === "SIGNUP_NOT_FOUND") {
      onRestart(result.error.message);
      return;
    }
    if (result.error.retryAfterSeconds) {
      setWaitUntil(Date.now() + result.error.retryAfterSeconds * 1000);
      setNow(Date.now());
    }
    setError(result.error.message);
  };

  return (
    <div className="register-step">
      <h1 ref={headingRef} tabIndex={-1}>
        Check your email
      </h1>
      <p className="register-lead">
        We've sent a {OTP_LENGTH}-digit code to <strong>{email}</strong>. It expires in 10 minutes.
      </p>

      <form className="register-form" onSubmit={submit} noValidate>
        <div className="register-field">
          <label htmlFor="otp-code">Verification code</label>
          <input
            id="otp-code"
            ref={inputRef}
            className="register-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, OTP_LENGTH))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={OTP_LENGTH}
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "otp-error" : undefined}
          />
          <div role="alert">
            {error && (
              <p className="register-error" id="otp-error">
                {error}
              </p>
            )}
          </div>
          <div role="status">{status && <p className="register-success">{status}</p>}</div>
        </div>

        <button type="submit" className="button button--gold register-submit" aria-disabled={busy}>
          {busy ? "Checking…" : "Confirm"} <ArrowRight size={16} aria-hidden />
        </button>
      </form>

      <div className="register-secondary">
        <button type="button" className="register-link" onClick={resend} aria-disabled={busy || secondsLeft > 0}>
          {secondsLeft > 0 ? `Send a new code (available in ${secondsLeft}s)` : "Send a new code"}
        </button>
        <button type="button" className="register-link" onClick={() => onRestart()}>
          Change my details
        </button>
      </div>
      <p className="register-hint">Can't find it? Check your spam or promotions folder.</p>
    </div>
  );
}
