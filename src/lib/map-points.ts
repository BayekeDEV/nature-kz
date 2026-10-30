import { MAP_PROJECTION } from "@/content/kazakhstan-outline";
import { projectToMap } from "@/lib/map";
import type { Coordinates, Destination } from "@/lib/types";

/** One destination on the schematic map, already projected into map units. */
export interface MapPoint {
  slug: string;
  name: string;
  region: string;
  number: number;
  coordinates: Coordinates;
  accent: string;
  /** Position in the outline's viewBox units — straight from projectToMap, never adjusted. */
  x: number;
  y: number;
}

/** Destinations with a published reference point, numbered in catalogue order. */
export function getMapPoints(destinations: Destination[]): MapPoint[] {
  return destinations.flatMap((d, index) => {
    if (!d.coordinates) return [];
    const { x, y } = projectToMap(d.coordinates.lat, d.coordinates.lon);
    return [{ slug: d.slug, name: d.name, region: d.region, number: index + 1, coordinates: d.coordinates, accent: d.theme.accent, x, y }];
  });
}

/* ---- Pure view maths for the interactive map (unit-tested) ---- */

/** The whole country plus a small margin, in map units. */
export const COUNTRY_VIEW = { x: -6, y: -6, w: MAP_PROJECTION.width + 12, h: MAP_PROJECTION.height + 12 };
export const MIN_SCALE = 1;
export const MAX_SCALE = 40;

export interface MapView {
  /** Zoom factor: 1 shows the whole country. */
  scale: number;
  /** Centre of the view in map units. */
  cx: number;
  cy: number;
}

export const INITIAL_VIEW: MapView = {
  scale: 1,
  cx: COUNTRY_VIEW.x + COUNTRY_VIEW.w / 2,
  cy: COUNTRY_VIEW.y + COUNTRY_VIEW.h / 2,
};

/** The visible rectangle for a view, kept inside the country frame. */
export function viewBox(view: MapView) {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale));
  const w = COUNTRY_VIEW.w / scale;
  const h = COUNTRY_VIEW.h / scale;
  const x = Math.min(COUNTRY_VIEW.x + COUNTRY_VIEW.w - w, Math.max(COUNTRY_VIEW.x, view.cx - w / 2));
  const y = Math.min(COUNTRY_VIEW.y + COUNTRY_VIEW.h - h, Math.max(COUNTRY_VIEW.y, view.cy - h / 2));
  return { x, y, w, h, scale };
}

/** Normalises a view so its centre matches the clamped rectangle. */
export function clampView(view: MapView): MapView {
  const box = viewBox(view);
  return { scale: box.scale, cx: box.x + box.w / 2, cy: box.y + box.h / 2 };
}

/** Distance in map units from a point to its nearest neighbour. */
export function nearestDistance(point: Pick<MapPoint, "x" | "y" | "slug">, points: Pick<MapPoint, "x" | "y" | "slug">[]) {
  let best = Infinity;
  for (const other of points) {
    if (other.slug === point.slug) continue;
    best = Math.min(best, Math.hypot(other.x - point.x, other.y - point.y));
  }
  return best;
}

/**
 * A view centred on `point`, zoomed in just enough that its nearest neighbour
 * is at least `minGapPx` away on screen. Isolated points therefore return to
 * the whole-country view, so selecting them never loses the wider context.
 */
export function focusView(
  point: Pick<MapPoint, "x" | "y" | "slug">,
  points: Pick<MapPoint, "x" | "y" | "slug">[],
  containerWidthPx: number,
  minGapPx = 44,
): MapView {
  const unitsPerPxAtScale1 = COUNTRY_VIEW.w / Math.max(containerWidthPx, 1);
  const needed = (minGapPx * unitsPerPxAtScale1) / nearestDistance(point, points);
  const scale = Math.min(MAX_SCALE, Math.max(needed, MIN_SCALE));
  return clampView({ scale, cx: point.x, cy: point.y });
}

/** Screen position of a point within the container, in pixels. */
export function toScreen(point: Pick<MapPoint, "x" | "y">, view: MapView, widthPx: number, heightPx: number) {
  const box = viewBox(view);
  return { left: ((point.x - box.x) / box.w) * widthPx, top: ((point.y - box.y) / box.h) * heightPx };
}

/**
 * Which markers can show their name permanently without colliding with a
 * neighbour (others show it on hover, focus or selection). Approximate label
 * box: `labelWidthPx` wide to the right of the marker and 26px tall.
 */
export function roomyLabels(
  points: Pick<MapPoint, "x" | "y" | "slug" | "name">[],
  view: MapView,
  widthPx: number,
  heightPx: number,
  charPx = 7.4,
): Set<string> {
  const placed = points.map((p) => ({ slug: p.slug, ...toScreen(p, view, widthPx, heightPx), labelW: 26 + p.name.length * charPx }));
  const roomy = new Set<string>();
  for (const a of placed) {
    if (a.left < 0 || a.left > widthPx || a.top < 0 || a.top > heightPx) continue;
    const fitsRight = a.left + a.labelW < widthPx - 4;
    const fitsLeft = a.left - a.labelW > 4;
    if (!fitsRight && !fitsLeft) continue;
    const clashes = placed.some(
      (b) => b.slug !== a.slug && Math.abs(b.top - a.top) < 26 && b.left > a.left - a.labelW - 14 && b.left < a.left + a.labelW + 14,
    );
    if (!clashes) roomy.add(a.slug);
  }
  return roomy;
}
