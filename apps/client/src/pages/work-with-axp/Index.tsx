import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "./sections/Hero";
import { Audiences } from "./sections/Audiences";
import { Reasons } from "./sections/Reasons";
import { ContactBand } from "./sections/ContactBand";

export function WorkWithAXPPage() {
  return (
    <SiteLayout>
      <Hero />
      <Audiences />
      <Reasons />
      <ContactBand />
    </SiteLayout>
  );
}
