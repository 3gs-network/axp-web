import "./AuthPage.css";
import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, MailCheck } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { AccountError, completeSignInFromUrl, resendConfirmation, signIn, signUp } from "@/lib/session";
import { getSessionId } from "@/lib/track";
import { BrandMark } from "@/components/layout/BrandMark";

/**
 * Sign in / sign up, against the AXP CRM's accounts (see lib/session.ts).
 *   1. Tri-state session gating — wait for the session check before deciding.
 *   2. Reverse guard — a signed-in person is sent on to /dashboard.
 *   3. On success, navigate with the router. NEVER window.location.reload().
 *
 * The CRM requires email confirmation, so sign-up ends on a "check your email"
 * step; the emailed link returns here and completeSignInFromUrl() finishes it.
 */
const AuthPage = () => {
  const navigate = useNavigate();
  const { status } = useSession();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);

  useEffect(() => {
    completeSignInFromUrl()
      .then((signedIn) => {
        if (signedIn) {
          toast.success("Email confirmed. Welcome to AXP.");
          navigate("/dashboard", { replace: true });
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "That link did not work. Please sign in.");
      });
  }, [navigate]);

  if (status === "loading") {
    return (
      <div className="auth-screen">
        <div className="auth-spinner" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setUnconfirmed(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setUnconfirmed(false);
    try {
      if (mode === "signup") {
        const result = await signUp({ name, email, password, phone: phone || undefined, sessionId: getSessionId() });
        if (result === "confirm_email") {
          setAwaitingConfirmation(true);
          return;
        }
        toast.success("Account created");
      } else {
        await signIn(email, password);
        toast.success("Signed in");
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error instanceof AccountError && error.code === "EMAIL_NOT_CONFIRMED") {
        setUnconfirmed(true);
      }
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    try {
      await resendConfirmation(email);
      toast.success("We've sent the link again.");
    } catch {
      toast.error("We couldn't resend the link just now. Please try again shortly.");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen-glow" aria-hidden="true" />
      <BrandMark inverse />
      <div className="auth-card">
        {awaitingConfirmation ? (
          <div className="auth-confirm">
            <MailCheck className="auth-confirm-icon" aria-hidden />
            <h1>Check your email</h1>
            <p>
              We've sent a confirmation link to <strong>{email}</strong>. Open it to finish creating your account.
            </p>
            <button type="button" className="auth-link" onClick={onResend}>
              Didn't get it? Send the link again
            </button>
          </div>
        ) : (
          <>
            <div className="auth-toggle" role="tablist" aria-label="Sign in or sign up">
              <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Sign up</button>
            </div>
            <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
            <p>{mode === "signup" ? "Start tracking your homeownership journey with AXP." : "Sign in to continue your homeownership journey."}</p>
            <form onSubmit={onSubmit}>
              {mode === "signup" && (
                <label>
                  <span>Full name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
                </label>
              )}
              <label>
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </label>
              {mode === "signup" && (
                <label>
                  <span>Phone (optional)</span>
                  <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
                </label>
              )}
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
              </label>
              <button type="submit" className="button button--gold" disabled={submitting}>
                {submitting ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"} <ArrowRight size={16} />
              </button>
            </form>
            {unconfirmed && (
              <button type="button" className="auth-link" onClick={onResend}>
                Resend the confirmation link
              </button>
            )}
          </>
        )}
      </div>
      <Link to="/" className="auth-back">← Back to homepage</Link>
    </div>
  );
};

export default AuthPage;
