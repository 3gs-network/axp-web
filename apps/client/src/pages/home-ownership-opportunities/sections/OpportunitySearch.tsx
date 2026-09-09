import "./OpportunitySearch.css";
import { useMemo, useState } from "react";
import { AlertCircle, BedDouble, Building2, ChevronDown, MapPin, RotateCcw, Search, Wallet } from "lucide-react";
import { OpportunityCard } from "@/components/shared/OpportunityCard";
import { useOpportunities } from "@/hooks/useOpportunities";

const pathwayOptions = ["Mortgage Available", "Ready to Move", "Off-Plan", "Flexible Payment", "Price Reduced"];

const budgetBrackets = [
  { label: "Under ₦50m", test: (value: number) => value < 50_000_000 },
  { label: "₦50m – ₦150m", test: (value: number) => value >= 50_000_000 && value < 150_000_000 },
  { label: "₦150m – ₦400m", test: (value: number) => value >= 150_000_000 && value < 400_000_000 },
  { label: "Over ₦400m", test: (value: number) => value >= 400_000_000 && Number.isFinite(value) },
];

export function OpportunitySearch() {
  const { data, isPending, isError, refetch } = useOpportunities();
  const opportunities = useMemo(() => data ?? [], [data]);

  const [locationFilter, setLocationFilter] = useState("All locations");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [budgetFilter, setBudgetFilter] = useState("All budgets");
  const [bedroomFilter, setBedroomFilter] = useState("All bedrooms");
  const [pathwayFilters, setPathwayFilters] = useState<string[]>([]);

  const locationOptions = useMemo(
    () => Array.from(new Set(opportunities.map((item) => item.location))).sort((a, b) => a.localeCompare(b)),
    [opportunities],
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(opportunities.map((item) => item.type))).sort((a, b) => a.localeCompare(b)),
    [opportunities],
  );
  const bedroomOptions = useMemo(
    () => Array.from(new Set(opportunities.flatMap((item) => item.bedroomCounts))).sort((a, b) => a - b),
    [opportunities],
  );

  const togglePathway = (pathway: string) =>
    setPathwayFilters((current) => (current.includes(pathway) ? current.filter((item) => item !== pathway) : [...current, pathway]));

  const visible = opportunities.filter((item) => {
    const matchesLocation = locationFilter === "All locations" || item.location === locationFilter;
    const matchesType = typeFilter === "All types" || item.type === typeFilter;
    const bracket = budgetBrackets.find((entry) => entry.label === budgetFilter);
    const matchesBudget = !bracket || bracket.test(item.priceValue);
    const matchesBedrooms = bedroomFilter === "All bedrooms" || item.bedroomCounts.includes(Number(bedroomFilter));
    const matchesPathways = pathwayFilters.every((pathway) => item.tags.includes(pathway));
    return matchesLocation && matchesType && matchesBudget && matchesBedrooms && matchesPathways;
  });

  const resetFilters = () => {
    setLocationFilter("All locations");
    setTypeFilter("All types");
    setBudgetFilter("All budgets");
    setBedroomFilter("All bedrooms");
    setPathwayFilters([]);
  };

  const isFiltered =
    locationFilter !== "All locations" ||
    typeFilter !== "All types" ||
    budgetFilter !== "All budgets" ||
    bedroomFilter !== "All bedrooms" ||
    pathwayFilters.length > 0;

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
                <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} disabled={isPending || isError}>
                  <option>All locations</option>
                  {locationOptions.map((option) => (
                    <option key={option}>{option}</option>
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
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} disabled={isPending || isError}>
                  <option>All types</option>
                  {typeOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="opportunity-select-chevron" />
              </span>
            </label>

            <label className="opportunity-field">
              <span className="opportunity-field-label">
                <Wallet aria-hidden />
                Budget / pathway
              </span>
              <span className="opportunity-select">
                <select value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)} disabled={isPending || isError}>
                  <option>All budgets</option>
                  {budgetBrackets.map((bracket) => (
                    <option key={bracket.label}>{bracket.label}</option>
                  ))}
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
                <select value={bedroomFilter} onChange={(event) => setBedroomFilter(event.target.value)} disabled={isPending || isError}>
                  <option value="All bedrooms">All bedrooms</option>
                  {bedroomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} {option === 1 ? "Bedroom" : "Bedrooms"}
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
                <input
                  type="checkbox"
                  checked={pathwayFilters.includes(pathway)}
                  onChange={() => togglePathway(pathway)}
                  disabled={isPending || isError}
                />
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

        <div className="opportunity-results-head">
          <div>
            <p className="eyebrow">Curated opportunities</p>
            <h2>
              {isPending
                ? "Loading opportunities"
                : isError
                  ? "Opportunities unavailable"
                  : `${visible.length} ${visible.length === 1 ? "opportunity" : "opportunities"} to explore`}
            </h2>
          </div>
        </div>

        {isPending && (
          <div className="opportunity-grid" aria-hidden>
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="opportunity-card opportunity-card--skeleton">
                <div className="opportunity-card-image" />
                <div className="opportunity-card-body">
                  <span className="skeleton-line skeleton-line--eyebrow" />
                  <span className="skeleton-line skeleton-line--title" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line skeleton-line--short" />
                </div>
              </article>
            ))}
          </div>
        )}

        {isError && (
          <div className="empty-state">
            <AlertCircle aria-hidden />
            <h3>We couldn&rsquo;t load opportunities</h3>
            <p>Something interrupted the connection. Please try again in a moment.</p>
            <button type="button" className="filter-reset" onClick={() => refetch()}>
              <RotateCcw aria-hidden />
              Retry
            </button>
          </div>
        )}

        {!isPending && !isError && (
          <div className="opportunity-grid">
            {visible.map((opportunity) => (
              <OpportunityCard key={opportunity.slug} opportunity={opportunity} />
            ))}
          </div>
        )}

        {!isPending && !isError && opportunities.length > 0 && visible.length === 0 && (
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

        {!isPending && !isError && opportunities.length === 0 && (
          <div className="empty-state">
            <Search aria-hidden />
            <h3>No opportunities listed yet</h3>
            <p>New curated opportunities are added regularly. Please check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
