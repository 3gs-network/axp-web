import "./FAQ.css";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list">
      {items.map(([q, a], index) => {
        const isOpen = open === index;
        return (
          <div key={q} className={isOpen ? "active" : ""}>
            <button onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
              <span>{q}</span>
              <ChevronDown aria-hidden />
            </button>
            <div className="faq-answer" aria-hidden={!isOpen}>
              <p>{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
