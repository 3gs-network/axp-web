import "./AuthPage.css";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth";
import { BrandMark } from "@/components/layout/BrandMark";

/**
 * Product auth page — adapted from the scaffold's reference page per the
 * rules in AGENTS.md (### Auth). The navigation contract is kept intact:
 *   1. Tri-state session gating — wait for the session check (loading) before
 *      deciding. Never treat "loading" as "guest".
 *   2. Reverse guard — an already-authenticated user is redirected away from
 *      /auth instead of being shown the login form again.
 *   3. On success, navigate with the router. NEVER window.location.reload().
 *
 * Email verification is intentionally not gated here — signup grants an
 * immediate session (matches the backend's requireEmailVerification: false).
 */
const AuthPage = () => {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isPending) {
    return (
      <div className="auth-screen">
        <div className="auth-spinner" />
      </div>
    );
  }

  if (session?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password });

      if (result.error) {
        throw new Error(result.error.message ?? "Authentication failed");
      }

      toast.success(mode === "signup" ? "Account created" : "Signed in");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen-glow" aria-hidden="true" />
      <BrandMark inverse />
      <div className="auth-card">
        <div className="auth-toggle" role="tablist" aria-label="Sign in or sign up">
          <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button>
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
      </div>
      <Link to="/" className="auth-back">← Back to homepage</Link>
    </div>
  );
};

export default AuthPage;
