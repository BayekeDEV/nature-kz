/**
 * Map provider configuration — the one place to change map data sources.
 *
 * Base layers are self-hosted, generated from Natural Earth (public domain) by
 * `scripts/build-atlas.mjs`:
 * - a land-cover + shaded-relief raster ("Natural Earth I"), reprojected to Web
 *   Mercator so it lines up exactly with MapLibre's coordinates;
 * - vector GeoJSON: Kazakhstan's boundary, neighbouring borders, lakes, rivers
 *   and a few English labels.
 *
 * Finer relief at closer zoom comes from the Terrain Tiles dataset on the AWS
 * Registry of Open Data (keyless, CORS-enabled). If those tiles fail, the
 * self-hosted layers still show a complete map.
 */

/** Geographic extent of the atlas raster (degrees). Must match scripts/build-atlas.mjs. */
export const ATLAS_BOUNDS = { west: 36, east: 97, south: 34, north: 60 } as const;

/** Kazakhstan plus all nine destinations, used for the initial view. */
export const KAZAKHSTAN_BOUNDS: [[number, number], [number, number]] = [
  [46.4, 40.5],
  [87.4, 55.5],
];

/** Area shown by the static map (homepage, guide pages, fallback): Kazakhstan with a little context. */
export const STATIC_VIEW = { west: 45.2, east: 88.6, south: 39.4, north: 56.4 } as const;

export const ATLAS_FILES = {
  /** Full-resolution relief raster for the interactive map. */
  relief: "/atlas/relief-mercator.webp",
  /** Smaller copy for the static preview and fallback. */
  reliefPreview: "/atlas/relief-mercator-preview.webp",
  /** Vector layers (FeatureCollection with a `layer` property on each feature). */
  vectors: "/atlas/atlas-layers.geojson",
} as const;

export const TERRAIN_TILES = {
  url: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
  encoding: "terrarium" as const,
  tileSize: 256,
  maxzoom: 12,
};

/** Credits shown under the interactive map (always visible, also in full screen). */
export const ATLAS_CREDITS = [
  { label: "Made with Natural Earth", href: "https://www.naturalearthdata.com/", note: "" },
  {
    label: "Terrain Tiles",
    href: "https://registry.opendata.aws/terrain-tiles/",
    note: "(Mapzen, AWS Open Data): SRTM and GMTED2010 courtesy of the U.S. Geological Survey; ETOPO1 courtesy of NOAA",
  },
] as const;
