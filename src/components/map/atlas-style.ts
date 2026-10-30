import type { ExpressionSpecification, StyleSpecification, SymbolLayerSpecification } from "maplibre-gl";
import { ATLAS_BOUNDS, ATLAS_FILES, TERRAIN_TILES } from "@/content/atlas";
import type { AtlasPoint } from "@/lib/atlas";

const { west, east, south, north } = ATLAS_BOUNDS;
/** Invisible icon reserving each HTML marker's space in label placement (added by AtlasMap). */
export const MARKER_SPACE = { id: "marker-space", size: 22 } as const;

const layerIs = (name: string): ExpressionSpecification => ["==", ["get", "layer"], name];

function landformLabels(id: string, rank: ExpressionSpecification, minzoom: number): SymbolLayerSpecification {
  return {
    id,
    type: "symbol",
    source: "atlas",
    minzoom,
    filter: ["all", layerIs("landform-label"), rank],
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Italic"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 3, 10.5, 7, 13],
      "text-letter-spacing": 0.08,
      "text-max-width": 8,
    },
    paint: { "text-color": "#efe3c8", "text-opacity": 0.75, "text-halo-color": "rgba(20, 17, 13, 0.75)", "text-halo-width": 1.2 },
  };
}

/**
 * The atlas style: self-hosted Natural Earth relief and vectors, with finer
 * hillshade from the AWS Terrain Tiles fading in only when zoomed in.
 * Colours are tuned to the site's dark, warm palette without hiding geography.
 */
export function atlasStyle(points: AtlasPoint[], origin: string): StyleSpecification {
  return {
    version: 8,
    glyphs: `${origin}/atlas/fonts/{fontstack}/{range}.pbf`,
    sources: {
      relief: {
        type: "image",
        url: ATLAS_FILES.relief,
        coordinates: [
          [west, north],
          [east, north],
          [east, south],
          [west, south],
        ],
      },
      terrain: {
        type: "raster-dem",
        tiles: [TERRAIN_TILES.url],
        encoding: TERRAIN_TILES.encoding,
        tileSize: TERRAIN_TILES.tileSize,
        maxzoom: TERRAIN_TILES.maxzoom,
        // Only request tiles over the atlas area.
        bounds: [west, south, east, north],
      },
      atlas: { type: "geojson", data: ATLAS_FILES.vectors },
      destinations: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: points.map((p) => ({
            type: "Feature",
            properties: { slug: p.slug, name: p.name },
            geometry: { type: "Point", coordinates: [p.coordinates.lon, p.coordinates.lat] },
          })),
        },
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#16140f" } },
      {
        id: "relief",
        type: "raster",
        source: "relief",
        // Already colour-graded by scripts/build-atlas.mjs.
        paint: { "raster-resampling": "linear", "raster-fade-duration": 0 },
      },
      {
        id: "hillshade",
        type: "hillshade",
        source: "terrain",
        minzoom: 5,
        paint: {
          "hillshade-exaggeration": ["interpolate", ["linear"], ["zoom"], 5, 0, 7, 0.35],
          "hillshade-shadow-color": "#2a2016",
          "hillshade-highlight-color": "#fff6e4",
          "hillshade-accent-color": "#3b2d1f",
        },
      },
      { id: "outside-mask", type: "fill", source: "atlas", filter: layerIs("outside-mask"), paint: { "fill-color": "#13110d", "fill-opacity": 0.42 } },
      {
        id: "water",
        type: "fill",
        source: "atlas",
        filter: layerIs("water"),
        paint: { "fill-color": "#2c6370", "fill-opacity": 0.95, "fill-outline-color": "rgba(150, 200, 205, 0.4)" },
      },
      {
        id: "rivers",
        type: "line",
        source: "atlas",
        filter: layerIs("river"),
        minzoom: 3.5,
        paint: {
          "line-color": "#5f9ea8",
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 3.5, 0.25, 6, 0.75],
          "line-width": ["interpolate", ["linear"], ["zoom"], 3.5, 0.5, 7, 1.4],
        },
      },
      { id: "neighbour-borders", type: "line", source: "atlas", filter: layerIs("neighbour"), paint: { "line-color": "#e8dfd0", "line-opacity": 0.22, "line-width": 0.7 } },
      { id: "kazakhstan-border-casing", type: "line", source: "atlas", filter: layerIs("kazakhstan"), paint: { "line-color": "#0f0d0a", "line-opacity": 0.5, "line-width": 3.4 } },
      { id: "kazakhstan-border", type: "line", source: "atlas", filter: layerIs("kazakhstan"), paint: { "line-color": "#efe6d6", "line-opacity": 0.85, "line-width": 1.3 } },
      {
        id: "water-labels",
        type: "symbol",
        source: "atlas",
        filter: ["all", layerIs("water"), ["has", "label"]],
        layout: { "text-field": ["get", "label"], "text-font": ["Open Sans Italic"], "text-size": 12, "symbol-placement": "point", "text-max-width": 7 },
        paint: { "text-color": "#bfe0e2", "text-halo-color": "rgba(14, 30, 34, 0.85)", "text-halo-width": 1.2 },
      },
      // Main landforms always; smaller ones only once zoomed in (hidden labels would still block others).
      landformLabels("landform-labels", ["<=", ["get", "rank"], 3], 0),
      landformLabels("landform-labels-minor", [">", ["get", "rank"], 3], 4.5),
      {
        id: "country-labels",
        type: "symbol",
        source: "atlas",
        filter: layerIs("country-label"),
        layout: {
          "text-field": ["upcase", ["get", "name"]],
          "text-font": ["Open Sans Semibold"],
          "text-size": ["case", ["get", "kaz"], 15, 11],
          "text-letter-spacing": ["case", ["get", "kaz"], 0.45, 0.25],
        },
        paint: { "text-color": "#e2d7c4", "text-opacity": ["case", ["get", "kaz"], 0.42, 0.5], "text-halo-color": "rgba(20, 17, 13, 0.6)", "text-halo-width": 1 },
      },
      {
        id: "cities",
        type: "circle",
        source: "atlas",
        filter: layerIs("city"),
        minzoom: 3.8,
        paint: { "circle-radius": 2.6, "circle-color": "#efe6d6", "circle-stroke-color": "#14110d", "circle-stroke-width": 1 },
      },
      {
        id: "city-labels",
        type: "symbol",
        source: "atlas",
        filter: layerIs("city"),
        minzoom: 3.8,
        layout: { "text-field": ["get", "name"], "text-font": ["Open Sans Regular"], "text-size": 11.5, "text-offset": [0, 0.9], "text-anchor": "top" },
        paint: { "text-color": "#e7ddcb", "text-halo-color": "rgba(20, 17, 13, 0.8)", "text-halo-width": 1.1 },
      },
      {
        // Destination names: placed by MapLibre's collision detection, so crowded names hide until zoomed in.
        id: "destination-labels",
        type: "symbol",
        source: "destinations",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold"],
          "text-size": 13,
          "text-variable-anchor": ["left", "right", "top", "bottom"],
          "text-radial-offset": 1.45,
          "text-justify": "auto",
          "text-max-width": 12,
        },
        paint: { "text-color": "#fbf6ec", "text-halo-color": "rgba(14, 12, 9, 0.9)", "text-halo-width": 1.6 },
      },
      {
        // Invisible boxes where the HTML markers sit. This layer is on top, so it is placed
        // first and every label below (including destination names) keeps clear of the markers.
        id: "destination-marker-space",
        type: "symbol",
        source: "destinations",
        layout: { "icon-image": MARKER_SPACE.id, "icon-allow-overlap": true },
      },
    ],
  };
}
