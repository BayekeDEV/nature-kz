"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DestinationCard } from "@/components/destination/DestinationCard";
import {
  CATEGORY_OPTIONS,
  filterDestinations,
  parseCatalogueParams,
  toCatalogueSearch,
  type CatalogueQuery,
  type CategoryFilter,
} from "@/lib/filter";
import type { DestinationSummary } from "@/lib/types";

interface Props {
  destinations: DestinationSummary[];
}

/**
 * Client-side search and filtering. The state lives in the URL (`?q=` and
 * `?type=`), so a filtered view can be shared or bookmarked.
 */
export function CatalogueBrowser({ destinations }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = parseCatalogueParams(searchParams);

  // The input keeps its own text so typing stays instant; the URL follows shortly after.
  const [text, setText] = useState(fromUrl.q);
  const [category, setCategory] = useState<CategoryFilter>(fromUrl.category);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Follow back/forward navigation that changes the URL.
  const urlKey = searchParams.toString();
  const [lastUrlKey, setLastUrlKey] = useState(urlKey);
  if (urlKey !== lastUrlKey) {
    setLastUrlKey(urlKey);
    // Ignore URL updates that we made ourselves (they match the local state),
    // so a trailing space being typed is not trimmed away mid-word.
    if (toCatalogueSearch({ q: text, category }) !== toCatalogueSearch(fromUrl)) {
      setText(fromUrl.q);
      setCategory(fromUrl.category);
    }
  }

  const query: CatalogueQuery = { q: text, category };
  const results = useMemo(() => filterDestinations(destinations, { q: text, category }), [destinations, text, category]);
  const isFiltered = text.trim() !== "" || category !== "all";

  useEffect(() => {
    const next = toCatalogueSearch({ q: text, category });
    const current = toCatalogueSearch(parseCatalogueParams(new URLSearchParams(window.location.search)));
    if (next === current) return;
    const timer = window.setTimeout(() => router.replace(`${pathname}${next}`, { scroll: false }), 250);
    return () => window.clearTimeout(timer);
  }, [text, category, pathname, router]);

  function reset() {
    setText("");
    setCategory("all");
    inputRef.current?.focus();
  }

  return (
    <div className="page-container pb-28">
      <div className="flex flex-col gap-6 border-y border-line py-6 lg:flex-row lg:items-center lg:justify-between">
        <form role="search" onSubmit={(event) => event.preventDefault()} className="w-full lg:max-w-md">
          <label htmlFor={inputId} className="eyebrow text-fg-muted">
            Search destinations
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-fg-muted" aria-hidden />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={text}
              maxLength={80}
              onChange={(event) => setText(event.target.value)}
              placeholder="Try “lake”, “Almaty” or “chalk”"
              autoComplete="off"
              className="min-h-12 w-full rounded-full border border-fg/25 bg-raised pr-12 pl-11 text-[1rem] text-fg placeholder:text-fg-muted/80 focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-fg [&::-webkit-search-cancel-button]:hidden"
            />
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search text"
                className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full text-fg-muted hover:text-fg"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </form>

        <fieldset>
          <legend className="eyebrow text-fg-muted">Landscape</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((option) => {
              const active = category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(option.value)}
                  className={`min-h-11 rounded-full border px-4 text-[0.95rem] transition ${
                    active ? "border-fg bg-fg text-page" : "border-fg/25 text-fg hover:border-fg"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex min-h-11 flex-wrap items-center justify-between gap-4">
        <p role="status" aria-live="polite" className="text-[0.98rem] text-fg-muted">
          {results.length === destinations.length
            ? `Showing all ${destinations.length} destinations`
            : `Showing ${results.length} of ${destinations.length} destinations`}
        </p>
        {isFiltered && (
          <button type="button" onClick={reset} className="min-h-11 border-b border-fg/40 font-medium hover:border-fg">
            Reset search and filters
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <ul className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {results.map((summary, position) => (
            <li key={summary.id}>
              <DestinationCard destination={summary} index={destinations.indexOf(summary)} headingLevel="h2" eager={position < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 border border-dashed border-fg/25 px-6 py-14 text-center md:py-20">
          <h2 className="heading-card">No destinations match {query.q.trim() ? `“${query.q.trim()}”` : "these filters"}</h2>
          <p className="mx-auto mt-3 max-w-md text-fg-soft">
            Check the spelling, try a broader word such as a region or landscape type, or clear the filters to see all {destinations.length}{" "}
            destinations.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-fg px-6 font-medium text-page hover:bg-fg-soft"
          >
            Show all destinations
          </button>
        </div>
      )}
    </div>
  );
}
