import "./OfficeInfo.css";
import { Globe2, Mail, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function OfficeInfo() {
  return (
    <section className="section contact-office section--alabaster">
      <div className="shell">
        <SectionHeading eyebrow="Good to know" title="A few more things before you reach out." />
        <div className="contact-office-grid">
          <div>
            <Mail />
            <h3>General enquiries</h3>
            <p>Reach us at <a href="mailto:info@axplimited.com">info@axplimited.com</a> or via <a href="https://wa.me/+2349026211153" target="_blank" rel="noreferrer">WhatsApp</a>.</p>
          </div>
          <div>
            <Globe2 />
            <h3>Pan-African outlook</h3>
            <p>AXP is a pan-African housing and urban-living brand. Early opportunities on this site draw on Nigeria’s market, with more countries to follow.</p>
          </div>
          <div>
            <ShieldCheck />
            <h3>Responsible contact</h3>
            <p>We only ask for the information needed to respond to your enquiry, and we won’t share your details without consent.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
