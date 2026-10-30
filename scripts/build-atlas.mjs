/**
 * Builds the self-hosted map layers in public/atlas/ from Natural Earth data
 * (public domain, https://www.naturalearthdata.com/). Run once; the outputs are
 * committed, so the site itself needs no map provider or API key.
 *
 * Usage:
 *   1. Download and unzip the 1:10m "Natural Earth I with Shaded Relief, Water
 *      and Drainages" raster:
 *      https://naciscdn.org/naturalearth/10m/raster/NE1_HR_LC_SR_W_DR.zip
 *   2. node scripts/build-atlas.mjs path/to/NE1_HR_LC_SR_W_DR.tif
 *
 * Vector layers are fetched from the Natural Earth GeoJSON mirror
 * (github.com/nvkelso/natural-earth-vector).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Must match ATLAS_BOUNDS in src/content/atlas.ts.
const B = { west: 36, east: 97, south: 34, north: 60 };
const OUT = path.join(process.cwd(), "public", "atlas");
const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";

const tif = process.argv[2];
if (!tif) throw new Error("Pass the path to NE1_HR_LC_SR_W_DR.tif");
fs.mkdirSync(OUT, { recursive: true });
sharp.cache(false);
sharp.concurrency(1);

/* ---- 1. Relief raster: crop the plate carrée source, reproject rows to Web Mercator ---- */

const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const latFromMercY = (y) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * (180 / Math.PI);

const meta = await sharp(tif, { limitInputPixels: false }).metadata();
const ppd = meta.width / 360; // pixels per degree (60 for the 1:10m raster)
const crop = {
  left: Math.round((B.west + 180) * ppd),
  top: Math.round((90 - B.north) * ppd),
  width: Math.round((B.east - B.west) * ppd),
  height: Math.round((B.north - B.south) * ppd),
};
const { data: src, info } = await sharp(tif, { limitInputPixels: false }).extract(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const lonSpanRad = ((B.east - B.west) * Math.PI) / 180;
const yTop = mercY(B.north);
const yBottom = mercY(B.south);
const H = Math.round((W * (yTop - yBottom)) / lonSpanRad);
const out = Buffer.alloc(W * H * 3);
for (let j = 0; j < H; j++) {
  // Latitude at the centre of this output row, then the matching source row.
  const lat = latFromMercY(yTop - ((j + 0.5) / H) * (yTop - yBottom));
  const s = Math.min(info.height - 1.001, Math.max(0, (B.north - lat) * ppd - 0.5));
  const r0 = Math.floor(s);
  const t = s - r0;
  for (let i = 0; i < W * 3; i++) {
    out[j * W * 3 + i] = Math.round(src[r0 * W * 3 + i] * (1 - t) + src[(r0 + 1) * W * 3 + i] * t);
  }
}
// Colour grade once here, so the interactive map and the static preview match:
// Natural Earth's pale cartographic palette becomes a darker, warmer one that
// sits on the site's dark pages, and its bright blue water becomes a muted teal.
// Relative differences in land cover and relief shading are kept.
for (let p = 0; p < out.length; p += 3) {
  const r = out[p];
  const g = out[p + 1];
  const b = out[p + 2];
  const shade = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
  if (b > r + 40 && b > g + 8) {
    // Water: muted teal, slightly lighter where the source is lighter (shallows).
    out[p] = Math.round(30 + 40 * shade);
    out[p + 1] = Math.round(70 + 60 * shade);
    out[p + 2] = Math.round(80 + 60 * shade);
    continue;
  }
  const l = 0.3 * r + 0.59 * g + 0.11 * b;
  const tone = (c, k) => Math.max(0, Math.min(255, Math.round(255 * Math.pow(((l + (c - l) * 0.72) / 255) * k, 1.55))));
  out[p] = tone(r, 0.86);
  out[p + 1] = tone(g, 0.8);
  out[p + 2] = tone(b, 0.8);
}
await sharp(out, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 82 }).toFile(path.join(OUT, "relief-mercator.webp"));
await sharp(out, { raw: { width: W, height: H, channels: 3 } }).resize({ width: 2200 }).webp({ quality: 80 }).toFile(path.join(OUT, "relief-mercator-preview.webp"));
console.log(`relief: ${W}×${H} (source ${ppd} px/degree)`);

/* ---- 2. Vector layers, clipped to the atlas extent ---- */

const inBox = ([x, y]) => x >= B.west && x <= B.east && y >= B.south && y <= B.north;
const round = ([x, y]) => [Math.round(x * 1e3) / 1e3, Math.round(y * 1e3) / 1e3];

/** Sutherland–Hodgman clip of one ring against the atlas box. */
function clipRing(ring) {
  const edges = [
    [(p) => p[0] >= B.west, (a, b) => [B.west, a[1] + ((b[1] - a[1]) * (B.west - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= B.east, (a, b) => [B.east, a[1] + ((b[1] - a[1]) * (B.east - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= B.south, (a, b) => [a[0] + ((b[0] - a[0]) * (B.south - a[1])) / (b[1] - a[1]), B.south]],
    [(p) => p[1] <= B.north, (a, b) => [a[0] + ((b[0] - a[0]) * (B.north - a[1])) / (b[1] - a[1]), B.north]],
  ];
  let pts = ring;
  for (const [inside, cut] of edges) {
    const next = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (inside(a)) {
        next.push(a);
        if (!inside(b)) next.push(cut(a, b));
      } else if (inside(b)) next.push(cut(a, b));
    }
    pts = next;
    if (!pts.length) break;
  }
  if (pts.length < 3) return null;
  return [...pts, pts[0]].map(round);
}

function clipPolygons(geometry) {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
  const kept = polys.map((rings) => rings.map(clipRing).filter(Boolean)).filter((rings) => rings.length);
  return kept.length ? { type: "MultiPolygon", coordinates: kept } : null;
}

function clipLines(geometry) {
  const lines = geometry.type === "LineString" ? [geometry.coordinates] : geometry.type === "MultiLineString" ? geometry.coordinates : [];
  const pieces = [];
  for (const line of lines) {
    let current = [];
    for (const p of line) {
      if (inBox(p)) current.push(round(p));
      else if (current.length) {
        if (current.length > 1) pieces.push(current);
        current = [];
      }
    }
    if (current.length > 1) pieces.push(current);
  }
  return pieces.length ? { type: "MultiLineString", coordinates: pieces } : null;
}

async function load(name) {
  const res = await fetch(NE + name, { headers: { "User-Agent": "NatureKZ atlas build" } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return (await res.json()).features;
}

const features = [];
const add = (layer, geometry, props = {}) => geometry && features.push({ type: "Feature", properties: { layer, ...props }, geometry });

const countries = await load("ne_10m_admin_0_countries.geojson");
const kaz = countries.find((f) => f.properties.ADM0_A3 === "KAZ");
// Natural Earth cuts out the Baikonur lease area (a separate unit, "KAB") as a hole inside
// Kazakhstan. It is Kazakhstan's territory, so keep only outer rings and skip that unit.
const outerRings = (geometry) => ({
  type: "MultiPolygon",
  coordinates: (geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates).map((rings) => [rings[0]]),
});
add("kazakhstan", clipPolygons(outerRings(kaz.geometry)));
for (const f of countries) {
  if (f.properties.ADM0_A3 === "KAB") continue;
  const g = clipPolygons(f.geometry);
  if (!g) continue;
  if (f.properties.ADM0_A3 !== "KAZ") add("neighbour", g);
  const label = [f.properties.LABEL_X, f.properties.LABEL_Y];
  if (inBox(label)) add("country-label", { type: "Point", coordinates: round(label) }, { name: f.properties.NAME_EN ?? f.properties.NAME, kaz: f.properties.ADM0_A3 === "KAZ" });
}

// Everything outside Kazakhstan is dimmed with one mask polygon (the atlas box with Kazakhstan cut out).
const box = [[B.west - 1, B.south - 1], [B.east + 1, B.south - 1], [B.east + 1, B.north + 1], [B.west - 1, B.north + 1], [B.west - 1, B.south - 1]];
const kazRings = (kaz.geometry.type === "Polygon" ? [kaz.geometry.coordinates] : kaz.geometry.coordinates).map((rings) => rings[0].map(round));
add("outside-mask", { type: "Polygon", coordinates: [box, ...kazRings] });

for (const f of await load("ne_10m_lakes.geojson")) {
  const g = clipPolygons(f.geometry);
  if (g) add("water", g, { name: f.properties.name_en ?? f.properties.name ?? "", rank: f.properties.scalerank });
}
for (const f of await load("ne_10m_geography_marine_polys.geojson")) {
  const g = clipPolygons(f.geometry);
  if (g) add("water", g, { name: f.properties.name_en ?? f.properties.name ?? "", rank: f.properties.scalerank });
}
for (const f of await load("ne_10m_rivers_lake_centerlines.geojson")) {
  if (f.properties.scalerank > 8) continue;
  const g = clipLines(f.geometry);
  if (g) add("river", g, { name: f.properties.name_en ?? f.properties.name ?? "", rank: f.properties.scalerank });
}

// A deliberately small set of labels: major lakes and seas, main landforms, two cities.
const WATER_LABELS = ["Caspian Sea", "Aral Sea", "Lake Balkhash", "Lake Alakol", "Lake Zaysan", "Lake Issyk-Kul"];
const keyWord = (label) => label.replace(/^Lake /, "").replace(/ Sea$/, "").toLowerCase();
for (const f of features) {
  if (f.properties.layer !== "water" || !f.properties.name) continue;
  const label = WATER_LABELS.find((l) => f.properties.name.toLowerCase().includes(keyWord(l)));
  if (label) f.properties.label = label;
}
// Landform names come from Natural Earth's region polygons, labelled at the centre of their extent.
const LANDFORM_CLASSES = new Set(["Range/mtn", "Plateau", "Desert", "Lowland", "Plain"]);
for (const f of await load("ne_10m_geography_regions_polys.geojson")) {
  const p = f.properties;
  if (p.SCALERANK > 4 || !LANDFORM_CLASSES.has(p.FEATURECLA)) continue;
  const all = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates).flat(2);
  const xs = all.map((c) => c[0]);
  const ys = all.map((c) => c[1]);
  const centre = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  if (inBox(centre)) add("landform-label", { type: "Point", coordinates: round(centre) }, { name: p.NAME_EN ?? p.NAME, rank: p.SCALERANK });
}

// Natural Earth still calls the capital Nur-Sultan; it was renamed back to Astana in 2022.
const CITY_NAMES = { "Nur-Sultan": "Astana", Astana: "Astana", Almaty: "Almaty" };
for (const f of await load("ne_10m_populated_places_simple.geojson")) {
  const name = CITY_NAMES[f.properties.name];
  if (name && f.properties.adm0_a3 === "KAZ") add("city", { type: "Point", coordinates: round(f.geometry.coordinates) }, { name, capital: f.properties.adm0cap === 1 });
}

// Label each lake or sea once, on its largest piece.
const labelled = new Map();
for (const f of features.filter((x) => x.properties.label)) {
  const size = JSON.stringify(f.geometry.coordinates).length;
  const best = labelled.get(f.properties.label);
  if (!best || size > best.size) labelled.set(f.properties.label, { f, size });
}
for (const f of features) if (f.properties.label && labelled.get(f.properties.label).f !== f) delete f.properties.label;

/* ---- 3. Kazakhstan outline in the raster's Mercator frame, for the static preview ---- */
// x/y in a 1000-wide viewBox that covers exactly the relief image.
const VB_H = Math.round((1000 * H) / W);
const toVb = ([lon, lat]) => [
  ((lon - B.west) / (B.east - B.west)) * 1000,
  ((yTop - mercY(lat)) / (yTop - yBottom)) * VB_H,
];
const outlinePath = kazRings
  .map((ring) => "M" + ring.filter((_, i) => i % 3 === 0 || i === ring.length - 1).map((c) => toVb(c).map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z")
  .join(" ");
fs.writeFileSync(
  path.join(process.cwd(), "src", "content", "atlas-outline.generated.ts"),
  `// Generated by scripts/build-atlas.mjs from Natural Earth (public domain). Do not edit by hand.
` +
    `export const ATLAS_VIEWBOX = { width: 1000, height: ${VB_H} } as const;
` +
    `export const KAZAKHSTAN_OUTLINE_MERCATOR = ${JSON.stringify(outlinePath)};
`,
);

fs.writeFileSync(path.join(OUT, "atlas-layers.geojson"), JSON.stringify({ type: "FeatureCollection", features }));
const count = (layer) => features.filter((f) => f.properties.layer === layer).length;
console.log("vectors:", ["kazakhstan", "neighbour", "water", "river", "country-label", "landform-label", "city"].map((l) => `${l}=${count(l)}`).join(" "));
console.log("water labels:", features.filter((f) => f.properties.label).map((f) => f.properties.label).join(", "));
console.log("landforms:", features.filter((f) => f.properties.layer === "landform-label").map((f) => f.properties.name).join(", "));
