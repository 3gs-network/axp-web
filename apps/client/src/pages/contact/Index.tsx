import { Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Routing } from "./sections/Routing";
import { OfficeInfo } from "./sections/OfficeInfo";

export function ContactPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact AXP" title="Choose why you’re here." copy="Select the reason closest to your enquiry to see the most relevant next step.">
        <div className="button-row">
          <a href="mailto:info@axplimited.com" className="button button--gold"><Mail size={16} /> Email AXP</a>
          <a href="https://wa.me/+2349026211153" target="_blank" rel="noreferrer" className="button button--ghost-light"><FaWhatsapp size={16} /> WhatsApp</a>
        </div>
      </PageHero>
      <Routing />
      <OfficeInfo />
    </SiteLayout>
  );
}
