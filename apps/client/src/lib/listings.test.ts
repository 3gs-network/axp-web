// Unit tests for the public listings feed adapter (lib/listings.ts) — the layer
// that turns the AXP platform's /api/public/listings payload into the
// Opportunity shape the marketing cards and detail page render.

import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOpportunities, mapListingToOpportunity, type Listing } from "@/lib/listings";

const baseListing: Listing = {
  id: "f3c1a4c7-0f01-47e5-a190-7e245a9e9f5e",
  slug: "bayfront-villas",
  name: "Bayfront Villas",
  location: "Lekki, Lagos",
  city: "Lagos",
  state: "Lagos",
  heroImageUrl: null,
  titleType: "Governor's Consent",
  mortgageAvailable: false,
  description: "Waterfront detached and semi-detached villas in Lekki.",
  updatedAt: "2026-08-21T09:35:30.210Z",
  images: [],
  features: [],
  unitTypes: [
    {
      id: "a",
      label: "5 Bedroom Detached Villa with BQ",
      category: "terrace",
      bedroomCount: 5,
      sizeSqm: 420,
      finishStatus: "finished",
      currency: "NGN",
      price: 38500000000,
      priceFormatted: "₦385,000,000",
      previousPrice: null,
      previousPriceFormatted: null,
      paymentPlanNote: "50% deposit, balance over 12 months",
      unitsAvailable: 3,
      status: "published",
    },
    {
      id: "b",
      label: "4 Bedroom Semi-Detached Villa",
      category: "terrace",
      bedroomCount: 4,
      sizeSqm: 340,
      finishStatus: "finished",
      currency: "NGN",
      price: 29500000000,
      priceFormatted: "₦295,000,000",
      previousPrice: 32000000000,
      previousPriceFormatted: "₦320,000,000",
      paymentPlanNote: "50% deposit, balance over 12 months",
      unitsAvailable: 5,
      status: "published",
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("mapListingToOpportunity", () => {
  it("derives price from the cheapest published unit", () => {
    const mapped = mapListingToOpportunity(baseListing);
    expect(mapped.price).toBe("From ₦295,000,000");
    expect(mapped.priceValue).toBe(295_000_000);
  });

  it("collapses bedroom counts into a range and exposes the raw counts", () => {
    const mapped = mapListingToOpportunity(baseListing);
    expect(mapped.bedrooms).toBe("4–5 Bedrooms");
    expect(mapped.bedroomCounts).toEqual([4, 5]);
  });

  it("builds tags from mortgage, finish status, payment plan and price cuts", () => {
    const mapped = mapListingToOpportunity({ ...baseListing, mortgageAvailable: true });
    expect(mapped.tags).toEqual(["Mortgage Available", "Ready to Move", "Flexible Payment", "Price Reduced"]);
  });

  it("falls back to curated imagery when the listing has none", () => {
    const mapped = mapListingToOpportunity(baseListing, 1);
    expect(mapped.image).toContain("res.cloudinary.com");
  });

  it("handles land listings with no bedrooms", () => {
    const plot: Listing = {
      ...baseListing,
      unitTypes: [
        { ...baseListing.unitTypes[0], category: "plot", bedroomCount: null, sizeSqm: 500, finishStatus: "n/a" },
      ],
    };
    const mapped = mapListingToOpportunity(plot);
    expect(mapped.type).toBe("Land");
    expect(mapped.bedrooms).toBe("Plots available");
    expect(mapped.bedroomCounts).toEqual([]);
  });

  it("ignores unpublished unit types when pricing", () => {
    const withDraft: Listing = {
      ...baseListing,
      unitTypes: [
        { ...baseListing.unitTypes[0], price: 100000000, priceFormatted: "₦1,000,000", status: "draft" },
        baseListing.unitTypes[1],
      ],
    };
    expect(mapListingToOpportunity(withDraft).price).toBe("From ₦295,000,000");
  });
});

describe("fetchOpportunities", () => {
  it("maps every listing in the response envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ data: [baseListing], page: 1, pageSize: 20, total: 1 })),
    );
    const result = await fetchOpportunities();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("bayfront-villas");
  });

  it("throws on a non-2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    await expect(fetchOpportunities()).rejects.toThrow(/500/);
  });
});
