// Shared by the app and the data scripts, so keep it free of server-only
// imports.

/** Lowercase, strip accents and punctuation: "São Paulo" → "sao paulo". */
export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ' -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Countries whose GeoNames postcode data isn't real postcodes, or that we
// never need (current city is always outside Spain).
export const POSTCODE_EXCLUDED = new Set(["AE", "ES"]);

/**
 * Reduce a postcode to the *area* we store, for both GeoNames rows and what
 * people type. We never store more detail than this.
 */
export function postcodeArea(country: string, raw: string): string {
  let pc = raw.toUpperCase().replace(/[\s-]+/g, "");
  switch (country) {
    case "GB": // outward code: "SW1A1AA" → "SW1A"
      if (pc.length >= 5) pc = pc.slice(0, -3);
      break;
    case "CA": // forward sortation area
    case "IE": // Eircode routing key
    case "JP":
    case "MT":
      pc = pc.slice(0, 3);
      break;
    case "NL":
    case "PT":
      pc = pc.slice(0, 4);
      break;
    case "US": // drop ZIP+4
    case "BR":
      pc = pc.slice(0, 5);
      break;
    case "SG": // postal sector
      pc = pc.slice(0, 2);
      break;
    case "LU":
      pc = pc.replace(/^L/, "");
      break;
    case "AR": // CPA "C1425ABC" → "1425"
      pc = pc.match(/\d{4}/)?.[0] ?? pc;
      break;
  }
  return pc;
}

/** Great-circle distance in km. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Spanish name of a country from its ISO code: "IE" → "Irlanda". */
const countryNames = new Intl.DisplayNames(["es-ES"], { type: "region" });
export function countryName(code: string): string {
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}
