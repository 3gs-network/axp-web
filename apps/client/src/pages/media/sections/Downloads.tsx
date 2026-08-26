import "./Downloads.css";
import { ChevronRight, Download } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function Downloads() {
  return (
    <section className="section section--alabaster">
      <div className="shell">
        <SectionHeading eyebrow="Media downloads" title="A clear source for approved brand materials." copy="Approved logos, corporate factsheets, leadership profiles and photography may be available in the future media library." />
        <div className="download-grid">
          <article><Download /><div><h3>AXP logo pack</h3></div><ChevronRight /></article>
          <article><Download /><div><h3>Corporate factsheet</h3></div><ChevronRight /></article>
          <article><Download /><div><h3>Media photography</h3></div><ChevronRight /></article>
        </div>
      </div>
    </section>
  );
}
