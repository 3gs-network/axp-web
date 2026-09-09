import { fetchPublicListings } from "@/lib/api";
import type { Opportunity } from "@/data/opportunities";

export type ListingFeature = {
  name: string;
  icon: string;
};

export type ListingUnitType = {
  id: string;
  label: string;
  category: string;
  bedroomCount: number | null;
  sizeSqm: number | null;
  finishStatus: string;
  currency: string;
  price: number;
  priceFormatted: string;
  previousPrice: number | null;
  previousPriceFormatted: string | null;
  paymentPlanNote: string | null;
  unitsAvailable: number;
  status: string;
};

export type ListingImage = {
  url?: string;
} & Record<string, unknown>;

export type Listing = {
  id: string;
  slug: string;
  name: string;
  location: string;
  city: string | null;
  state: string | null;
  heroImageUrl: string | null;
  titleType: string | null;
  mortgageAvailable: boolean;
  description: string;
  updatedAt: string;
  images: Array<ListingImage | string>;
  features: ListingFeature[];
  unitTypes: ListingUnitType[];
};

export type ListingsResponse = {
  data: Listing[];
  page: number;
  pageSize: number;
  total: number;
};

// Curated imagery from the marketing set, used when a listing has no artwork of
// its own yet. Indexed by listing position so the grid still feels varied.
const FALLBACK_IMAGES = [
  "https://res.cloudinary.com/gxhmv4fu/image/upload/w_800,c_limit,f_auto,q_auto/v1785536364/bedroom-terrace_catqzl.jpg",
  "https://res.cloudinary.com/gxhmv4fu/image/upload/w_800,c_limit,f_auto,q_auto/v1785536366/family-residence_q3gcl0.jpg",
  "https://res.cloudinary.com/gxhmv4fu/image/upload/w_800,c_limit,f_auto,q_auto/v1785536365/mordern-apartment-collection_bbphcm.jpg",
  "https://res.cloudinary.com/gxhmv4fu/image/upload/w_800,c_limit,f_auto,q_auto/v1785536365/future-living-opportunities_e4dpmo.jpg",
];

const CATEGORY_LABELS: Record<string, string> = {
  terrace: "Terrace",
  apartment: "Apartment",
  maisonette: "Maisonette",
  loft: "Loft",
  plot: "Land",
  detached: "Detached",
  "semi-detached": "Semi-Detached",
  duplex: "Duplex",
};

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function publishedUnits(listing: Listing) {
  return listing.unitTypes.filter((unit) => unit.status === "published");
}

function resolveImage(listing: Listing, index: number) {
  if (listing.heroImageUrl) return listing.heroImageUrl;
  const firstImage = listing.images?.[0];
  if (typeof firstImage === "string" && firstImage) return firstImage;
  if (firstImage && typeof firstImage === "object" && typeof firstImage.url === "string") return firstImage.url;
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function resolveType(units: ListingUnitType[]) {
  const categories = Array.from(new Set(units.map((unit) => unit.category).filter(Boolean)));
  if (categories.length === 0) return "Residence";
  if (categories.length > 1) return "Mixed Development";
  const [category] = categories;
  return CATEGORY_LABELS[category] ?? titleCase(category);
}

function resolveBedrooms(units: ListingUnitType[]) {
  const counts = units
    .map((unit) => unit.bedroomCount)
    .filter((count): count is number => typeof count === "number" && count > 0);
  if (counts.length === 0) return "Plots available";
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const range = min === max ? `${min}` : `${min}–${max}`;
  return `${range} ${max === 1 ? "Bedroom" : "Bedrooms"}`;
}

function resolveSize(units: ListingUnitType[]) {
  const sizes = units
    .map((unit) => unit.sizeSqm)
    .filter((size): size is number => typeof size === "number" && size > 0);
  if (sizes.length === 0) return "Size on request";
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  return min === max ? `${min} sqm` : `${min}–${max} sqm`;
}

function resolvePrice(units: ListingUnitType[]) {
  const priced = units.filter((unit) => typeof unit.price === "number" && unit.price > 0);
  if (priced.length === 0) return { label: "Price on request", value: Number.POSITIVE_INFINITY };
  const cheapest = priced.reduce((lowest, unit) => (unit.price < lowest.price ? unit : lowest));
  return { label: `From ${cheapest.priceFormatted}`, value: Math.round(cheapest.price / 100) };
}

function resolveTags(listing: Listing, units: ListingUnitType[]) {
  const tags: string[] = [];
  if (listing.mortgageAvailable) tags.push("Mortgage Available");
  if (units.some((unit) => unit.finishStatus === "finished")) tags.push("Ready to Move");
  if (units.some((unit) => unit.finishStatus === "shell" || unit.finishStatus === "off-plan")) tags.push("Off-Plan");
  if (units.some((unit) => unit.paymentPlanNote)) tags.push("Flexible Payment");
  if (units.some((unit) => unit.previousPrice && unit.previousPrice > unit.price)) tags.push("Price Reduced");
  return tags;
}

export type MappedOpportunity = Opportunity & {
  priceValue: number;
  bedroomCounts: number[];
};

export function mapListingToOpportunity(listing: Listing, index = 0): MappedOpportunity {
  const units = publishedUnits(listing);
  const price = resolvePrice(units);
  return {
    slug: listing.slug,
    title: listing.description,
    headline: listing.name,
    location: listing.location,
    price: price.label,
    priceValue: price.value,
    type: resolveType(units),
    bedrooms: resolveBedrooms(units),
    bedroomCounts: Array.from(
      new Set(units.map((unit) => unit.bedroomCount).filter((count): count is number => typeof count === "number" && count > 0)),
    ).sort((a, b) => a - b),
    bathrooms: resolveSize(units),
    parking: listing.titleType ?? "Title on request",
    tags: resolveTags(listing, units),
    image: resolveImage(listing, index),
    overview: listing.description,
  };
}

export async function fetchOpportunities(signal?: AbortSignal): Promise<MappedOpportunity[]> {
  const response = await fetchPublicListings(signal);
  if (!response.ok) {
    throw new Error(`Listings request failed (${response.status})`);
  }
  const payload = (await response.json()) as ListingsResponse;
  return (payload.data ?? []).map((listing, index) => mapListingToOpportunity(listing, index));
}
