import { destinations } from "@/content/destinations";
import { resolveMedia } from "@/lib/media";
import type { Destination, DestinationSummary, ImageRole, ResolvedMedia } from "@/lib/types";

/**
 * Data-access layer. Pages ask these functions for content instead of
 * importing the dataset directly, so the storage can later move to PostgreSQL
 * (see docs/ARCHITECTURE.md) without touching the components.
 */

export const FEATURED_SLUG = "bozzhyra";

/**
 * The homepage shows a curated selection rather than every destination, so it
 * stays a comfortable length as the collection grows. Every destination is
 * still in the catalogue and on the map.
 */
export const HOME_SELECTION = [
  "kolsai-lakes",
  "charyn-canyon",
  "big-almaty-lake",
  "katon-karagay",
  "torysh-valley-of-balls",
  "lake-balkhash",
  "bayanaul-jasybay",
  "aksu-zhabagly",
];

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

export function getHomeSelection(): DestinationSummary[] {
  return HOME_SELECTION.map(getDestinationBySlug)
    .filter((d): d is Destination => d !== undefined)
    .map(toSummary);
}

/** Photo credits grouped by destination, for the photo credits page. Only files actually on disk are listed. */
export function getPhotoCreditsByDestination() {
  return destinations
    .map((d) => ({ name: d.name, slug: d.slug, photos: d.media.map(resolveMedia).filter((m) => m.available) }))
    .filter((group) => group.photos.length > 0);
}
