import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { RegisterFlow } from "./sections/RegisterFlow";

/**
 * /register -- HomeReady sign-up with email verification. Lives alongside the
 * existing "Register interest" route on /contact so the two can be compared;
 * it does not replace it.
 */
export function RegisterPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="HomeReady™"
        title="Register your interest."
        copy="Tell us a little about you and we'll guide you through the next steps towards owning your home."
      />
      <RegisterFlow />
    </SiteLayout>
  );
}
