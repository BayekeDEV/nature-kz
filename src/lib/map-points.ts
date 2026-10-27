import type { MapPoint } from "@/components/map/KazakhstanMap";
import type { Destination } from "@/lib/types";

/** Destinations with a published reference point, numbered in catalogue order. */
export function getMapPoints(destinations: Destination[]): MapPoint[] {
  return destinations.flatMap((d, index) =>
    d.coordinates
      ? [{ slug: d.slug, name: d.name, number: index + 1, coordinates: d.coordinates, accent: d.theme.accent }]
      : [],
  );
}
