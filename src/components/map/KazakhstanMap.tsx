import Link from "next/link";
import { KAZAKHSTAN_OUTLINE_PATH, MAP_PROJECTION } from "@/content/kazakhstan-outline";
import { projectToMap } from "@/lib/map";
import type { Coordinates } from "@/lib/types";

export interface MapPoint {
  slug: string;
  name: string;
  number: number;
  coordinates: Coordinates;
  accent: string;
}

type LabelSide = "left" | "right" | "below";

interface Bounds {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

/** The south-east corner, where five destinations sit close together. */
const SOUTH_EAST: Bounds = { minLon: 76.8, maxLon: 79.35, minLat: 42.62, maxLat: 44.0 };

function boundsToBox(b: Bounds) {
  const topLeft = projectToMap(b.maxLat, b.minLon);
  const bottomRight = projectToMap(b.minLat, b.maxLon);
  return { x: topLeft.x, y: topLeft.y, w: bottomRight.x - topLeft.x, h: bottomRight.y - topLeft.y };
}

const COUNTRY_BOX = { x: -6, y: -6, w: MAP_PROJECTION.width + 12, h: MAP_PROJECTION.height + 12 };
const SOUTH_EAST_BOX = boundsToBox(SOUTH_EAST);

const SOUTH_EAST_LABELS: Record<string, LabelSide> = {
  "kolsai-lakes": "left",
  "charyn-canyon": "left",
};

export function isInSouthEast({ lat, lon }: Pick<Coordinates, "lat" | "lon">) {
  return lon >= SOUTH_EAST.minLon && lon <= SOUTH_EAST.maxLon && lat >= SOUTH_EAST.minLat && lat <= SOUTH_EAST.maxLat;
}

interface Props {
  points: MapPoint[];
  title: string;
  /** "country" groups the crowded south-east into a dashed box; "south-east" zooms into it. */
  view?: "country" | "south-east";
  /** Show only this destination (guide pages). */
  highlightSlug?: string;
}

/**
 * Schematic overview: a simplified country outline (SVG) with HTML markers
 * placed at published reference points using the same projection. Markers are
 * HTML so labels and tap targets keep a readable size at any width.
 * It is deliberately not a navigational map — no roads, routes or terrain.
 */
export function KazakhstanMap({ points, title, view = "country", highlightSlug }: Props) {
  const box = view === "south-east" ? SOUTH_EAST_BOX : COUNTRY_BOX;
  const groupSouthEast = view === "country" && !highlightSlug;
  const southEastCount = points.filter((p) => isInSouthEast(p.coordinates)).length;

  const visible = points.filter((p) => {
    if (highlightSlug) return p.slug === highlightSlug;
    if (groupSouthEast) return !isInSouthEast(p.coordinates);
    return true;
  });

  const toPercent = (x: number, y: number) => ({ left: `${((x - box.x) / box.w) * 100}%`, top: `${((y - box.y) / box.h) * 100}%` });
  const inset = toPercent(SOUTH_EAST_BOX.x, SOUTH_EAST_BOX.y);

  return (
    <div role="group" aria-label={title} className="relative">
      <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} aria-hidden className="block h-auto w-full overflow-hidden">
        <path
          d={KAZAKHSTAN_OUTLINE_PATH}
          className="fill-fg/[0.07] stroke-fg/40"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>

      {groupSouthEast && southEastCount > 0 && (
        <div
          aria-hidden
          className="absolute border border-dashed border-fg/55 bg-fg/5"
          style={{ ...inset, width: `${(SOUTH_EAST_BOX.w / box.w) * 100}%`, height: `${(SOUTH_EAST_BOX.h / box.h) * 100}%` }}
        >
          <span className="absolute right-0 bottom-full mb-1 hidden text-[0.75rem] font-medium whitespace-nowrap text-fg sm:block">
            South-east detail: {southEastCount} destinations
          </span>
        </div>
      )}

      <ul>
        {visible.map((point) => {
          const { x, y } = projectToMap(point.coordinates.lat, point.coordinates.lon);
          // Labels go left of points in the far east so they never run off the edge.
          const side: LabelSide =
            view === "south-east" ? (SOUTH_EAST_LABELS[point.slug] ?? "right") : (x - box.x) / box.w > 0.68 ? "left" : "right";
          return (
            <li key={point.slug} className="absolute" style={toPercent(x, y)}>
              <Link
                href={`/destinations/${point.slug}`}
                aria-label={`${point.number}. ${point.name} — open guide`}
                className="group absolute top-0 left-0 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none"
              >
                <span
                  aria-hidden
                  className="grid size-5 place-items-center rounded-full border-2 sm:size-6 border-page text-[0.7rem] font-semibold text-[#14110D] shadow-sm transition-transform group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-fg"
                  style={{ backgroundColor: point.accent }}
                >
                  {point.number}
                </span>
                <span
                  aria-hidden
                  className={`absolute text-[0.8rem] leading-tight font-medium whitespace-nowrap text-fg group-hover:underline group-focus-visible:underline sm:text-[0.875rem] ${LABEL_CLASS[side]}`}
                >
                  {point.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const LABEL_CLASS: Record<LabelSide, string> = {
  right: "left-full top-1/2 -translate-y-1/2 -ml-0.5",
  left: "right-full top-1/2 -translate-y-1/2 -mr-0.5",
  below: "top-full left-1/2 -translate-x-1/2 -mt-1",
};
