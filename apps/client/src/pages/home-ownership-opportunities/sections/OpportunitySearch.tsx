import "./OpportunitySearch.css";
import { useMemo, useState } from "react";
import { BedDouble, Building2, ChevronDown, Inbox, MapPin, RotateCcw, Search, Wallet } from "lucide-react";
import { OpportunityCard } from "@/components/shared/OpportunityCard";
import { useOpportunities } from "@/data/useOpportunities";

const pathwayOptions = ["Mortgage Available", "Ready to Move", "Off-Plan", "Flexible Payment"];

const ALL = "All";

export function OpportunitySearch() {
  const { opportunities, status } = useOpportunities();

  // Yesterday's dropdown was built around the four placeholder listings'
  // exact values (Lekki/Abuja/Ibadan, "2 Bedrooms"/"3 Bedrooms") -- a fixed
  // list that would silently stop matching anything real the moment the CRM
  // published different locations or unit sizes. These are computed from
  // whatever is actually published instead.
  const locations = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.location))).sort(),
    [opportunities]
  );
  const types = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.type))).sort(),
    [opportunities]
  );
  const bedroomCounts = useMemo(
    () =>
      Array.from(new Set(opportunities.map((o) => o.bedroomsValue).filter((n): n is number => n !== null))).sort(
        (a, b) => a - b
      ),
    [opportunities]
  );

  const [locationFilter, setLocationFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [budgetFilter, setBudgetFilter] = useState(ALL);
  const [bedroomFilter, setBedroomFilter] = useState<number | typeof ALL>(ALL);
  const [pathwayFilters, setPathwayFilters] = useState<string[]>([]);

  const togglePathway = (pathway: string) =>
    setPathwayFilters((current) => (current.includes(pathway) ? current.filter((item) => item !== pathway) : [...current, pathway]));

  const visible = opportunities.filter((item) => {
    const matchesLocation = locationFilter === ALL || item.location === locationFilter;
    const matchesType = typeFilter === ALL || item.type === typeFilter;
    // Real numeric comparisons, not string-matching a formatted display value
    // -- the previous version checked item.price.includes("₦85"), which only
    // ever matched the one placeholder price it was written against.
    const matchesBudget =
      budgetFilter === ALL ||
      (budgetFilter === "Up to ₦100m" && item.priceValue !== null && item.priceValue <= 100_000_000) ||
      (budgetFilter === "Over ₦100m" && item.priceValue !== null && item.priceValue > 100_000_000) ||
      (budgetFilter === "To be confirmed" && item.priceValue === null);
    const matchesBedrooms = bedroomFilter === ALL || item.bedroomsValue === bedroomFilter;
    const matchesPathways = pathwayFilters.every((pathway) => item.tags.includes(pathway));
    return matchesLocation && matchesType && matchesBudget && matchesBedrooms && matchesPathways;
  });

  const resetFilters = () => {
    setLocationFilter(ALL);
    setTypeFilter(ALL);
    setBudgetFilter(ALL);
    setBedroomFilter(ALL);
    setPathwayFilters([]);
  };

  const isFiltered =
    locationFilter !== ALL || typeFilter !== ALL || budgetFilter !== ALL || bedroomFilter !== ALL || pathwayFilters.length > 0;

  return (
    <section className="section opportunity-search">
      <div className="shell">
        <div className="opportunity-filter-panel">
          <div className="opportunity-filter-head">
            <p className="eyebrow">Explore opportunities</p>
            <h2>Start with what matters to you.</h2>
          </div>

          <div className="opportunity-filters">
            <label className="opportunity-field">
              <span className="opportunity-field-label">
                <MapPin aria-hidden />
                Location
              </span>
              <span className="opportunity-select">
                <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                  <option value={ALL}>All locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="opportunity-select-chevron" />
              </span>
            </label>

            <label className="opportunity-field">
              <span className="opportunity-field-label">
                <Building2 aria-hidden />
                Property type
              </span>
              <span className="opportunity-select">
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <option value={ALL}>All types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="opportunity-select-chevron" />
              </span>
            </label>

            <label className="opportunity-field">
              <span className="opportunity-field-label">
                <Wallet aria-hidden />
                Budget
              </span>
              <span className="opportunity-select">
                <select value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)}>
                  <option value={ALL}>All budgets</option>
                  <option>Up to ₦100m</option>
                  <option>Over ₦100m</option>
                  <option>To be confirmed</option>
                </select>
                <ChevronDown aria-hidden className="opportunity-select-chevron" />
              </span>
            </label>

            <label className="opportunity-field">
              <span className="opportunity-field-label">
                <BedDouble aria-hidden />
                Bedrooms
              </span>
              <span className="opportunity-select">
                <select
                  value={bedroomFilter}
                  onChange={(event) => setBedroomFilter(event.target.value === ALL ? ALL : Number(event.target.value))}
                >
                  <option value={ALL}>All bedrooms</option>
                  {bedroomCounts.map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "Bedroom" : "Bedrooms"}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="opportunity-select-chevron" />
              </span>
            </label>
          </div>

          <fieldset className="pathway-filter-group">
            <legend>Ownership features</legend>
            {pathwayOptions.map((pathway) => (
              <label key={pathway} className="pathway-chip">
                <input type="checkbox" checked={pathwayFilters.includes(pathway)} onChange={() => togglePathway(pathway)} />
                <span>{pathway}</span>
              </label>
            ))}
          </fieldset>

          <div className="opportunity-filter-foot">
            {isFiltered && (
              <button type="button" className="filter-reset" onClick={resetFilters}>
                <RotateCcw aria-hidden />
                Reset filters
              </button>
            )}
          </div>
        </div>

        {status !== "loading" && (
          <div className="opportunity-results-head">
            <div>
              <p className="eyebrow">Curated opportunities</p>
              <h2>
                {visible.length} {visible.length === 1 ? "opportunity" : "opportunities"} to explore
              </h2>
            </div>
          </div>
        )}

        {status === "ready" && (
          <div className="opportunity-grid">
            {visible.map((opportunity) => (
              <OpportunityCard key={opportunity.slug} opportunity={opportunity} />
            ))}
          </div>
        )}

        {status === "ready" && visible.length === 0 && (
          <div className="empty-state">
            <Search aria-hidden />
            <h3>No matches</h3>
            <p>Try another filter combination to explore the full set.</p>
            <button type="button" className="filter-reset" onClick={resetFilters}>
              <RotateCcw aria-hidden />
              Reset filters
            </button>
          </div>
        )}

        {status === "empty" && (
          <div className="empty-state">
            <Inbox aria-hidden />
            <h3>No opportunities published yet</h3>
            <p>Our team is preparing the first listings. Check back soon, or get in touch to discuss what you're looking for.</p>
          </div>
        )}

        {status === "unavailable" && (
          <div className="empty-state">
            <Inbox aria-hidden />
            <h3>Listings are temporarily unavailable</h3>
            <p>Please try again shortly, or get in touch and we'll help directly.</p>
          </div>
        )}
      </div>
    </section>
  );
}
