import "./Portal.css";
import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { knowledgeItems } from "@/data/knowledge";
import { SectionHeading } from "@/components/shared/SectionHeading";

const types = ["All", "Housing guides", "Mortgage education", "Market intelligence", "Urban Living Reports", "Policy insights", "ReadyIQ™", "Research publications", "Videos", "Downloads"];

export function Portal() {
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
            <article key={item.title} className={item.featured ? "featured" : ""}>
              {item.featured && <img src="/images/african_city.jpg" alt="An African urban community" />}
              <div>
                <span>{item.type}</span>
                <h2>{item.title}</h2>
                <p>{item.read} read</p>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <div className="empty-state"><Search /><h3>No matching guidance</h3><p>Try a broader topic or reset the filter.</p><button onClick={resetFilters}>Reset search</button></div>}
      </div>
    </section>
  );
}
