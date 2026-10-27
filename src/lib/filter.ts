import type { DestinationSummary, LandscapeCategory } from "@/lib/types";

/** Pure catalogue logic — no React, so it is easy to unit-test. */

export type CategoryFilter = "all" | LandscapeCategory;

export const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lakes", label: "Lakes" },
  { value: "canyons-rocks", label: "Canyons & Rock Formations" },
  { value: "dunes", label: "Dunes" },
];

export const CATEGORY_LABELS: Record<LandscapeCategory, string> = {
  lakes: "Lakes",
  "canyons-rocks": "Canyons & Rock Formations",
  dunes: "Dunes",
};

export interface CatalogueQuery {
  q: string;
  category: CategoryFilter;
}

const MAX_QUERY_LENGTH = 80;

function isCategory(value: string | null | undefined): value is CategoryFilter {
  return CATEGORY_OPTIONS.some((option) => option.value === value);
}

/** Reads `?q=` and `?type=` safely; unknown values fall back to defaults. */
export function parseCatalogueParams(params: { get(name: string): string | null }): CatalogueQuery {
  const rawType = params.get("type");
  return {
    q: (params.get("q") ?? "").slice(0, MAX_QUERY_LENGTH),
    category: isCategory(rawType) ? rawType : "all",
  };
}

/** Builds the query string for a catalogue state, omitting defaults. */
export function toCatalogueSearch({ q, category }: CatalogueQuery): string {
  const params = new URLSearchParams();
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  if (category !== "all") params.set("type", category);
  const search = params.toString();
  return search ? `?${search}` : "";
}

function normalise(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Every word of the query must appear somewhere in the destination's
 * searchable text (name, region, landscape, summary and keywords).
 */
export function filterDestinations<T extends Pick<DestinationSummary, "category" | "searchText">>(
  items: T[],
  { q, category }: CatalogueQuery,
): T[] {
  const terms = normalise(q).split(" ").filter(Boolean);
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = normalise(item.searchText);
    return terms.every((term) => haystack.includes(term));
  });
}
