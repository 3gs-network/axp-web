const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNaira(value: number): string {
  if (!Number.isFinite(value)) return "₦0.00";
  const formatted = nairaFormatter.format(value);
  return formatted.startsWith("NGN") ? formatted.replace("NGN", "₦") : formatted;
}

/** Adds thousands separators to a raw digit string as the user types, e.g. "1700000" -> "1,700,000". */
export function formatInputValue(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

/** Strips formatting back to a plain digit string, keeping at most one decimal point. */
export function parseInputValue(display: string): string {
  const digits = display.replace(/[^\d.]/g, "");
  const firstDot = digits.indexOf(".");
  if (firstDot === -1) return digits;
  return digits.slice(0, firstDot + 1) + digits.slice(firstDot + 1).replace(/\./g, "");
}
