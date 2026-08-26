import "./OpportunitySearch.css";
import { useState } from "react";
import { BedDouble, Building2, ChevronDown, MapPin, RotateCcw, Search, Wallet } from "lucide-react";
import { OpportunityCard } from "@/components/shared/OpportunityCard";
import { opportunityData } from "@/data/opportunities";

const pathwayOptions = ["Mortgage Available", "Ready to Move", "Off-Plan", "Flexible Payment"];

export function OpportunitySearch() {
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [budgetFilter, setBudgetFilter] = useState("All budgets");
  const [bedroomFilter, setBedroomFilter] = useState("All bedrooms");
  const [pathwayFilters, setPathwayFilters] = useState<string[]>([]);

  const togglePathway = (pathway: string) =>
    setPathwayFilters((current) => (current.includes(pathway) ? current.filter((item) => item !== pathway) : [...current, pathway]));

  const visible = opportunityData.filter((item) => {
    const matchesLocation = locationFilter === "All locations" || item.location.includes(locationFilter);
    const matchesType = typeFilter === "All types" || item.type === typeFilter;
    const matchesBudget =
      budgetFilter === "All budgets" ||
      (budgetFilter === "Up to ₦100m" && item.price.includes("₦85")) ||
      (budgetFilter === "Flexible payment" && item.tags.includes("Flexible Payment")) ||
      (budgetFilter === "Mortgage pathway" && item.tags.includes("Mortgage Available")) ||
      (budgetFilter === "To be confirmed" && item.price === "Details to be confirmed");
    const matchesBedrooms =
      bedroomFilter === "All bedrooms" || item.bedrooms === bedroomFilter || (bedroomFilter === "To be confirmed" && item.bedrooms === "To be confirmed");
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
                <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                  <option>All locations</option>
                  <option>Lekki</option>
                  <option>Abuja</option>
                  <option>Ibadan</option>
                  <option>Nigeria</option>
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
                  <option>All types</option>
                  <option>Terrace</option>
                  <option>Family Home</option>
                  <option>Apartment</option>
                  <option>Upcoming</option>
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
                <select value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)}>
                  <option>All budgets</option>
                  <option>Up to ₦100m</option>
                  <option>Flexible payment</option>
                  <option>Mortgage pathway</option>
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
                <select value={bedroomFilter} onChange={(event) => setBedroomFilter(event.target.value)}>
                  <option>All bedrooms</option>
                  <option>2 Bedrooms</option>
                  <option>3 Bedrooms</option>
                  <option>To be confirmed</option>
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

        <div className="opportunity-results-head">
          <div>
            <p className="eyebrow">Curated opportunities</p>
            <h2>
              {visible.length} {visible.length === 1 ? "opportunity" : "opportunities"} to explore
            </h2>
          </div>
        </div>

        <div className="opportunity-grid">
          {visible.map((opportunity) => (
            <OpportunityCard key={opportunity.slug} opportunity={opportunity} />
          ))}
        </div>

        {visible.length === 0 && (
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
      </div>
    </section>
  );
}
