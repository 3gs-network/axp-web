export type Opportunity = {
  slug: string;
  title: string;
  headline: string;
  location: string;
  price: string;
  /** Raw NGN amount behind `price`, or null when unstated. For filtering --
   *  `price` is a formatted display string and must never be parsed. */
  priceValue: number | null;
  type: string;
  bedrooms: string;
  /** Raw count behind `bedrooms`, or null when unstated. */
  bedroomsValue: number | null;
  bathrooms: string;
  parking: string;
  tags: string[];
  image: string;
  overview: string;
};

/** Shown when a listing has no photo yet. The same fallback the Knowledge
 *  Centre's featured card uses, rather than a new asset for one missing case. */
export const FALLBACK_IMAGE = "/images/african_city.jpg";

type CrmProperty = {
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  images: unknown;
  features: unknown;
};

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/**
 * A published CRM listing has no `parking` field -- that column does not
 * exist on our side. Rather than invent a number, this reads it from a
 * feature line if whoever published the listing wrote one ("2 Parking
 * Spaces" among the features), and says plainly that it wasn't stated
 * otherwise. features minus the parking line become the card's tags.
 */
function splitParking(features: string[]): { parking: string; tags: string[] } {
  const parking = features.find((f) => /parking/i.test(f));
  return {
    parking: parking ?? "Parking details on request",
    tags: features.filter((f) => f !== parking)
  };
}

const nairaPrice = (value: number | null): { price: string; priceValue: number | null } =>
  value && value > 0
    ? { price: `From ₦${value.toLocaleString("en-NG")}`, priceValue: value }
    : { price: "Details to be confirmed", priceValue: null };

const countLabel = (n: number | null, unit: string): string =>
  n && n > 0 ? `${n} ${unit}${n === 1 ? "" : "s"}` : "To be confirmed";

/** A CRM row becomes the same shape every existing card, filter and detail
 *  section already reads -- so none of that code needs to change, only where
 *  the data comes from. */
export function toOpportunity(p: CrmProperty): Opportunity {
  const { price, priceValue } = nairaPrice(p.price);
  const bedroomsValue = typeof p.bedrooms === "number" ? p.bedrooms : null;
  const { parking, tags } = splitParking(strings(p.features));
  const images = strings(p.images);

  return {
    slug: p.slug,
    title: p.title,
    headline: p.summary?.trim() || p.title,
    location: p.location?.trim() || [p.city, p.state].filter(Boolean).join(", ") || "Nigeria",
    price,
    priceValue,
    type: p.property_type?.trim() || "Home",
    bedrooms: countLabel(bedroomsValue, "Bedroom"),
    bedroomsValue,
    bathrooms: countLabel(p.bathrooms, "Bathroom"),
    parking,
    tags,
    image: images[0] ?? FALLBACK_IMAGE,
    overview: p.description?.trim() || p.summary?.trim() || ""
  };
}
