import { RegisterFlow } from "./sections/RegisterFlow";
import { RegisterShowcase } from "./sections/RegisterShowcase";

/**
 * /register -- HomeReady sign-up with email verification. A standalone,
 * split-screen page (no site header or footer), like /auth: the left half
 * shows what HomeReady is, the right half holds the form. It lives alongside
 * the existing "Register interest" route on /contact; it does not replace it.
 */
export function RegisterPage() {
  return (
    <div className="register-page">
      <RegisterShowcase />
      <RegisterFlow />
    </div>
  );
}
