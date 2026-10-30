import type { AtlasPoint } from "@/lib/atlas";
import { getMedia } from "@/lib/destinations";
import { CATEGORY_LABELS } from "@/lib/filter";
import type { Destination } from "@/lib/types";

/** Server-only: builds map points from the shared dataset (reads photo files via getMedia). */
export function getAtlasPoints(destinations: Destination[]): AtlasPoint[] {
  return destinations.flatMap((d, index) => {
    if (!d.coordinates) return [];
    const hero = getMedia(d, "hero");
    return [
      {
        id: d.id,
        slug: d.slug,
        name: d.name,
        region: d.region,
        category: CATEGORY_LABELS[d.category],
        number: index + 1,
        coordinates: d.coordinates,
        accent: d.theme.accent,
        hero: { src: hero.src, alt: hero.alt, available: hero.available, width: hero.width, height: hero.height },
      },
    ];
  });
}

