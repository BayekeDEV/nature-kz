import { describe, expect, it } from "vitest";
import { KAZAKHSTAN_OUTLINE_PATH } from "@/content/kazakhstan-outline";
import { getAllDestinations } from "@/lib/destinations";
import { projectToMap } from "@/lib/map";
import { COUNTRY_VIEW, focusView, getMapPoints, INITIAL_VIEW, MAX_SCALE, roomyLabels, toScreen, viewBox } from "@/lib/map-points";

/** Parses the outline's "M x y L x y … Z" rings into point lists. */
function outlineRings() {
  return KAZAKHSTAN_OUTLINE_PATH.split("Z")
    .map((ring) => [...ring.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => [Number(m[1]), Number(m[2])] as const))
    .filter((ring) => ring.length > 2);
}

function insidePolygon([x, y]: readonly [number, number], ring: readonly (readonly [number, number])[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const points = getMapPoints(getAllDestinations());
const mainland = outlineRings().sort((a, b) => b.length - a.length)[0];

describe("map projection", () => {
  it("matches the outline: Kazakhstan's extreme longitudes and latitudes land on its edges", () => {
    const xs = mainland.map((p) => p[0]);
    const ys = mainland.map((p) => p[1]);
    // Approximate national extremes: 46.5°E–87.3°E, 40.6°N–55.4°N.
    expect(Math.min(...xs)).toBeCloseTo(projectToMap(48, 46.5).x, -1);
    expect(Math.max(...xs)).toBeCloseTo(projectToMap(48, 87.3).x, -1);
    expect(Math.min(...ys)).toBeCloseTo(projectToMap(55.4, 70).y, -1);
    expect(Math.max(...ys)).toBeCloseTo(projectToMap(40.6, 70).y, -1);
  });

  it("plots every destination, at exactly its projected coordinate", () => {
    expect(points).toHaveLength(getAllDestinations().length);
    for (const p of points) {
      const projected = projectToMap(p.coordinates.lat, p.coordinates.lon);
      expect(p.x).toBe(projected.x);
      expect(p.y).toBe(projected.y);
    }
  });

  it("places every reference point inside the country outline", () => {
    for (const p of points) expect(insidePolygon([p.x, p.y], mainland), p.slug).toBe(true);
  });

  it("keeps real geography: Markakol east of Kaindy, Aktolagay west of Burabay, Burabay furthest north", () => {
    const at = (slug: string) => points.find((p) => p.slug === slug)!;
    expect(at("markakol-lake").x).toBeGreaterThan(at("kaindy-lake").x);
    expect(at("aktolagay-plateau").x).toBeLessThan(at("burabay-zhumbaktas").x);
    expect(at("aktolagay-plateau").y).toBeLessThan(at("bozzhyra").y);
    expect(Math.min(...points.map((p) => p.y))).toBe(at("burabay-zhumbaktas").y);
  });
});

describe("map view", () => {
  it("starts with the whole country", () => {
    expect(viewBox(INITIAL_VIEW)).toEqual({ ...COUNTRY_VIEW, scale: 1 });
  });

  it("zooms a phone-width map far enough to separate Kolsai and Kaindy without moving them", () => {
    const kolsai = points.find((p) => p.slug === "kolsai-lakes")!;
    const kaindy = points.find((p) => p.slug === "kaindy-lake")!;
    const width = 350;
    const height = (width * COUNTRY_VIEW.h) / COUNTRY_VIEW.w;
    const view = focusView(kolsai, points, width);
    const a = toScreen(kolsai, view, width, height);
    const b = toScreen(kaindy, view, width, height);
    expect(Math.hypot(a.left - b.left, a.top - b.top)).toBeGreaterThanOrEqual(43.9);
    expect(view.scale).toBeLessThanOrEqual(MAX_SCALE);
    // The selected marker is on screen.
    expect(a.left).toBeGreaterThan(0);
    expect(a.left).toBeLessThan(width);
  });

  it("returns to the whole country for an isolated destination", () => {
    const markakol = points.find((p) => p.slug === "markakol-lake")!;
    expect(focusView(markakol, points, 800).scale).toBe(1);
  });

  it("does not show permanent labels for crowded south-eastern markers at full view", () => {
    const roomy = roomyLabels(points, INITIAL_VIEW, 800, (800 * COUNTRY_VIEW.h) / COUNTRY_VIEW.w);
    expect(roomy.has("kolsai-lakes")).toBe(false);
    expect(roomy.has("kaindy-lake")).toBe(false);
    expect(roomy.has("markakol-lake")).toBe(true);
    expect(roomy.has("burabay-zhumbaktas")).toBe(true);
  });
});
