import { ATLAS_BOUNDS } from "@/content/atlas";
import { ATLAS_VIEWBOX } from "@/content/atlas-outline.generated";
import type { Coordinates, ResolvedMedia } from "@/lib/types";

/**
 * Geography helpers for the atlas. Everything uses Web Mercator — the same
 * projection as MapLibre and as the relief raster built by scripts/build-atlas.mjs —
 * so markers, raster and vectors line up.
 */

export const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** Position of a coordinate inside the atlas image, in its viewBox units (1000 wide). */
export function atlasPosition(lat: number, lon: number) {
  const top = mercatorY(ATLAS_BOUNDS.north);
  const bottom = mercatorY(ATLAS_BOUNDS.south);
  return {
    x: ((lon - ATLAS_BOUNDS.west) / (ATLAS_BOUNDS.east - ATLAS_BOUNDS.west)) * ATLAS_VIEWBOX.width,
    y: ((top - mercatorY(lat)) / (top - bottom)) * ATLAS_VIEWBOX.height,
  };
}

/** Rectangle (viewBox units) covering a geographic view, for cropping the static map. */
export function atlasCrop(view: { west: number; east: number; south: number; north: number }) {
  const topLeft = atlasPosition(view.north, view.west);
  const bottomRight = atlasPosition(view.south, view.east);
  return { x: topLeft.x, y: topLeft.y, width: bottomRight.x - topLeft.x, height: bottomRight.y - topLeft.y };
}

/** Everything the map needs about one destination — plain data, safe to pass to client components. */
export interface AtlasPoint {
  id: string;
  slug: string;
  name: string;
  region: string;
  category: string;
  number: number;
  /** Published reference point, unchanged from the dataset. */
  coordinates: Coordinates;
  accent: string;
  hero: Pick<ResolvedMedia, "src" | "alt" | "available" | "width" | "height">;
}

/** Zoom level that fits `pointsDistanceKm` into roughly `pixels` at a given latitude (Web Mercator, 512px tiles). */
export function zoomToSeparate(distanceKm: number, pixels: number, lat: number) {
  const metresPerPixelAtZoom0 = (40075016.686 * Math.cos((lat * Math.PI) / 180)) / 512;
  return Math.log2((metresPerPixelAtZoom0 * pixels) / (distanceKm * 1000));
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: Pick<Coordinates, "lat" | "lon">, b: Pick<Coordinates, "lat" | "lon">) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
