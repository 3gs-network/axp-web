import "./Portal.css";
import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { useKnowledge } from "@/data/useKnowledge";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { KnowledgeItem } from "@/data/knowledge";

// Events are shown in Lagos time whatever the visitor's clock says: the event
// happens in Lagos, and a visitor abroad converting it wrongly is worse than
// seeing the local time labelled as such.
const eventDate = new Intl.DateTimeFormat("en-NG", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Lagos"
});

function EventDetails({ event }: { event: NonNullable<KnowledgeItem["event"]> }) {
  const when = new Date(event.startsAt);
  const valid = !Number.isNaN(when.getTime());
  // A past event keeps its card -- it is a record of what the firm did -- but
  // loses the invite button, which would only lead to a closed form.
  const upcoming = valid && when.getTime() > Date.now();
  return (
    <>
      <p className="knowledge-event-meta">
        {valid ? `${upcoming ? "" : "Held "}${eventDate.format(when)} WAT` : "Date to be confirmed"}
        {event.location ? ` · ${event.location}` : ""}
      </p>
      {upcoming && event.ctaUrl && (
        <a className="knowledge-event-cta" href={event.ctaUrl} target="_blank" rel="noopener noreferrer">
          {event.ctaLabel?.trim() || "RSVP"}
        </a>
      )}
    </>
  );
}

const types = ["All", "Events", "Housing guides", "Mortgage education", "Market intelligence", "Urban Living Reports", "Policy insights", "ReadyIQ™", "Research publications", "Videos", "Downloads"];

export function Portal() {
  // Published posts from the AXP CRM, falling back to the built-in list until
  // somebody publishes one. Everything below is unchanged.
  const { items: knowledgeItems } = useKnowledge();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = knowledgeItems.filter((item) => (filter === "All" || item.type === filter) && item.title.toLowerCase().includes(query.toLowerCase()));
  const isFiltered = filter !== "All" || query !== "";
  const resetFilters = () => { setFilter("All"); setQuery(""); };

  return (
    <section className="section knowledge-portal">
      <div className="shell">
        <SectionHeading eyebrow="Knowledge library" title="Explore guidance by topic." copy="Filter by theme or search to find what’s most relevant to your stage of the journey." />
        <div className="knowledge-controls">
          <div className="knowledge-controls-top">
            <span className="control-label">Filter by topic</span>
            <div className="filter-row">{types.map((type) => <button key={type} className={filter === type ? "active" : ""} onClick={() => setFilter(type)}>{type}</button>)}</div>
          </div>
          <div className="knowledge-controls-bottom">
            <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guidance" /></label>
            <div className="knowledge-controls-meta">
              <p className="knowledge-count">{filtered.length} of {knowledgeItems.length} guides</p>
              {isFiltered && <button type="button" className="filter-reset" onClick={resetFilters}><RotateCcw size={13} /> Reset</button>}
            </div>
          </div>
        </div>
        <div className="knowledge-grid">
          {filtered.map((item) => (
            <article key={item.slug ?? item.title} className={[item.featured ? "featured" : "", item.event ? "is-event" : ""].filter(Boolean).join(" ")}>
              {item.featured && <img src={item.image ?? "/images/african_city.jpg"} alt={item.image ? "" : "An African urban community"} />}
              <div>
                <span>{item.type}</span>
                <h2>{item.title}</h2>
                {item.event ? <EventDetails event={item.event} /> : <p>{item.read} read</p>}
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <div className="empty-state"><Search /><h3>No matching guidance</h3><p>Try a broader topic or reset the filter.</p><button onClick={resetFilters}>Reset search</button></div>}
      </div>
    </section>
  );
}
