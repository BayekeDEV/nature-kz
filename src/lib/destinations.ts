import { destinations } from "@/content/destinations";
import { resolveMedia } from "@/lib/media";
import type { Destination, DestinationSummary, ImageRole, ResolvedMedia } from "@/lib/types";

/**
 * Data-access layer. Pages ask these functions for content instead of
 * importing the dataset directly, so the storage can later move to PostgreSQL
 * (see docs/ARCHITECTURE.md) without touching the components.
 */

export const FEATURED_SLUG = "bozzhyra";

export function getAllDestinations(): Destination[] {
  return destinations;
}

export function getDestinationSlugs(): string[] {
  return destinations.map((d) => d.slug);
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function getFeaturedDestination(): Destination {
  const featured = getDestinationBySlug(FEATURED_SLUG);
  if (!featured) throw new Error(`Featured destination "${FEATURED_SLUG}" is missing from the dataset.`);
  return featured;
}

export function getMedia(destination: Destination, role: ImageRole): ResolvedMedia {
  const record = destination.media.find((m) => m.role === role);
  if (!record) throw new Error(`Destination "${destination.slug}" has no media record for role "${role}".`);
  return resolveMedia(record);
}

export function getGalleryMedia(destination: Destination): ResolvedMedia[] {
  return destination.media
    .filter((m) => m.role !== "hero")
    .map(resolveMedia)
    // Only real photographs belong in a gallery; never pad it with placeholders.
    .filter((m) => m.available);
}

export function getRelatedDestinations(destination: Destination): Destination[] {
  return destination.relatedSlugs
    .map(getDestinationBySlug)
    .filter((d): d is Destination => d !== undefined && d.slug !== destination.slug)
    .slice(0, 3);
}

export function toSummary(destination: Destination): DestinationSummary {
  return {
    id: destination.id,
    slug: destination.slug,
    name: destination.name,
    region: destination.region,
    category: destination.category,
    landscape: destination.landscape,
    summary: destination.summary,
    searchText: [destination.name, destination.region, destination.landscape, destination.summary, ...destination.keywords]
      .join(" ")
      .toLowerCase(),
    theme: destination.theme,
    hero: getMedia(destination, "hero"),
  };
}

export function getDestinationSummaries(): DestinationSummary[] {
  return destinations.map(toSummary);
}

/** Every photo credit across the site, for the About page. */
export function getAllPhotoCredits() {
  return destinations.flatMap((d) =>
    d.media.map(resolveMedia).filter((m) => m.available).map((m) => ({ destination: d.name, slug: d.slug, ...m })),
  );
}
