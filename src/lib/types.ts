/**
 * Shared content types. Every destination fact lives in `src/content/` and is
 * typed here, so components never invent or hard-code destination data.
 * These shapes intentionally mirror the future PostgreSQL tables described in
 * `docs/ARCHITECTURE.md` (destinations, destination_images, sources).
 */

export type LandscapeCategory = "lakes" | "canyons-rocks" | "dunes";

export type ContentStatus =
  /** Written from sources that were actually consulted on `verifiedOn`. */
  | "verified"
  /** Conservative draft that still needs a source check before publishing. */
  | "draft";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  /** What kind of authority this is, so readers can weigh it. */
  kind: "official-park" | "official-tourism" | "government" | "news" | "reference";
  /** ISO date (YYYY-MM-DD) when this source was opened and read for this site. */
  accessedOn: string;
}

export type ImageRole = "hero" | "gallery-01" | "gallery-02" | "gallery-03";

export interface MediaRecord {
  role: ImageRole;
  /** Public path, following `/images/destinations/<slug>/<role>.jpg`. */
  src: string;
  alt: string;
  caption: string;
  /** Intrinsic size of the local file (used for aspect ratio in the lightbox). */
  width: number;
  height: number;
  /** CSS object-position for wide (desktop) and tall (mobile) crops. */
  focal: { desktop: string; mobile: string };
  credit: {
    author: string;
    license: string;
    licenseUrl?: string;
    /** The page where the file and its license were checked. */
    sourceUrl: string;
    /** Where the file came from, e.g. "Wikimedia Commons". */
    via: string;
  };
}

/** A media record after the server has checked that the file exists. */
export interface ResolvedMedia extends MediaRecord {
  available: boolean;
}

export interface Coordinates {
  lat: number;
  lon: number;
  /** What the point represents — never imply it is a trailhead or route. */
  represents: string;
  sourceId: string;
}

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  /** Source ids supporting this section. */
  sourceIds: string[];
}

export interface DestinationTheme {
  /** Decorative accent for rules, markers and focus details. */
  accent: string;
  /** Darker accent that passes contrast for text on the paper background. */
  deep: string;
  /** Pale tint for placeholders and quiet panels. */
  wash: string;
}

export interface QuickFact {
  label: string;
  value: string;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  /** Short geographic line, e.g. "Mangystau Region, western Kazakhstan". */
  region: string;
  category: LandscapeCategory;
  /** Human label for the landscape, e.g. "Chalk escarpment". */
  landscape: string;
  /** One or two sentences for cards. */
  summary: string;
  /** 20–40 word hero introduction. */
  intro: string;
  /** Extra words that should match in catalogue search. */
  keywords: string[];
  quickFacts: QuickFact[];
  special: GuideSection;
  history: GuideSection;
  planning: GuideSection;
  coordinates: Coordinates | null;
  mapSearchQuery: string;
  relatedSlugs: string[];
  theme: DestinationTheme;
  heroPlacement: "left" | "right";
  media: MediaRecord[];
  sources: Source[];
  status: ContentStatus;
  /** ISO date when the research for this guide was actually carried out. */
  verifiedOn: string | null;
}

/** The small projection of a destination that client components receive. */
export interface DestinationSummary {
  id: string;
  slug: string;
  name: string;
  region: string;
  category: LandscapeCategory;
  landscape: string;
  summary: string;
  searchText: string;
  theme: DestinationTheme;
  hero: ResolvedMedia;
}
