import type { Coordinates } from "@/lib/types";

export function formatCoordinates({ lat, lon }: Pick<Coordinates, "lat" | "lon">) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}° ${ns}, ${Math.abs(lon).toFixed(3)}° ${ew}`;
}

/** OpenStreetMap links need no API key and no account. */
export function osmPointUrl({ lat, lon }: Pick<Coordinates, "lat" | "lon">, zoom = 12) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
}

export function osmSearchUrl(query: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}
