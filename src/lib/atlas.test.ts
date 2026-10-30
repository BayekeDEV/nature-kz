import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ATLAS_BOUNDS, KAZAKHSTAN_BOUNDS, STATIC_VIEW } from "@/content/atlas";
import { ATLAS_VIEWBOX } from "@/content/atlas-outline.generated";
import { destinations } from "@/content/destinations";
import { atlasCrop, atlasPosition, distanceKm, mercatorY, zoomToSeparate } from "@/lib/atlas";

type Ring = [number, number][];
const layers = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/atlas/atlas-layers.geojson"), "utf8")) as {
  features: { properties: { layer: string }; geometry: { type: string; coordinates: Ring[][] } }[];
};
const kazakhstan = layers.features.find((f) => f.properties.layer === "kazakhstan")!;

/** Ray-casting point-in-polygon over Kazakhstan's outer rings. */
function insideKazakhstan(lon: number, lat: number) {
  return kazakhstan.geometry.coordinates.some(([ring]) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  });
}

const plotted = destinations.filter((d) => d.coordinates);

describe("atlas projection", () => {
  it("maps the atlas corners to the corners of the image", () => {
    const topLeft = atlasPosition(ATLAS_BOUNDS.north, ATLAS_BOUNDS.west);
    const bottomRight = atlasPosition(ATLAS_BOUNDS.south, ATLAS_BOUNDS.east);
    expect(topLeft.x).toBeCloseTo(0);
    expect(topLeft.y).toBeCloseTo(0);
    expect(bottomRight.x).toBeCloseTo(ATLAS_VIEWBOX.width);
    expect(bottomRight.y).toBeCloseTo(ATLAS_VIEWBOX.height, 0);
  });

  it("uses Web Mercator, so latitudes stretch towards the north", () => {
    expect(mercatorY(0)).toBeCloseTo(0);
    expect(mercatorY(55) - mercatorY(50)).toBeGreaterThan(mercatorY(45) - mercatorY(40));
  });

  it("keeps the static view and initial view inside the relief image", () => {
    const crop = atlasCrop(STATIC_VIEW);
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(ATLAS_VIEWBOX.width);
    expect(crop.y + crop.height).toBeLessThanOrEqual(ATLAS_VIEWBOX.height);
    const [[west, south], [east, north]] = KAZAKHSTAN_BOUNDS;
    expect(west).toBeGreaterThan(ATLAS_BOUNDS.west);
    expect(east).toBeLessThan(ATLAS_BOUNDS.east);
    expect(south).toBeGreaterThan(ATLAS_BOUNDS.south);
    expect(north).toBeLessThan(ATLAS_BOUNDS.north);
  });
});

describe("destination positions", () => {
  it("plots all nine destinations", () => {
    expect(plotted).toHaveLength(9);
  });

  it.each(plotted.map((d) => [d.slug, d.coordinates!] as const))("%s lies inside Kazakhstan and the initial view", (_slug, { lat, lon }) => {
    expect(insideKazakhstan(lon, lat)).toBe(true);
    const [[west, south], [east, north]] = KAZAKHSTAN_BOUNDS;
    expect(lon).toBeGreaterThan(west);
    expect(lon).toBeLessThan(east);
    expect(lat).toBeGreaterThan(south);
    expect(lat).toBeLessThan(north);
  });

  it("keeps geographic order on the map", () => {
    const at = (slug: string) => {
      const c = destinations.find((d) => d.slug === slug)!.coordinates!;
      return atlasPosition(c.lat, c.lon);
    };
    expect(at("bozzhyra").x).toBeLessThan(at("aktolagay-plateau").x); // Bozzhyra is further west
    expect(at("burabay-zhumbaktas").y).toBeLessThan(at("kolsai-lakes").y); // Burabay is further north
    expect(at("markakol-lake").x).toBeGreaterThan(at("charyn-canyon").x); // Markakol is furthest east
  });
});

describe("zoom helpers", () => {
  it("measures great-circle distance", () => {
    // Almaty to Astana is roughly 970 km in a straight line.
    expect(distanceKm({ lat: 43.24, lon: 76.89 }, { lat: 51.17, lon: 71.45 })).toBeGreaterThan(940);
    expect(distanceKm({ lat: 43.24, lon: 76.89 }, { lat: 51.17, lon: 71.45 })).toBeLessThan(1000);
  });

  it("zooms in further to separate closer points", () => {
    expect(zoomToSeparate(10, 100, 43)).toBeGreaterThan(zoomToSeparate(100, 100, 43));
    expect(zoomToSeparate(10, 100, 43) - zoomToSeparate(20, 100, 43)).toBeCloseTo(1);
  });
});
