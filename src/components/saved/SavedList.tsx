"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DestinationImage } from "@/components/media/DestinationImage";
import { CATEGORY_LABELS } from "@/lib/filter";
import { themeStyle } from "@/lib/format";
import { useSavedDestinations } from "@/lib/use-saved-destinations";
import type { DestinationSummary } from "@/lib/types";

export function SavedList({ destinations }: { destinations: DestinationSummary[] }) {
  const { ids, hydrated, persistent, remove } = useSavedDestinations();

  if (!hydrated) {
    return (
      <div className="page-container pb-28">
        <p className="border-t border-line pt-10 text-muted" aria-live="polite">
          Loading your saved destinations…
        </p>
      </div>
    );
  }

  // Keep the order in which things were saved; ignore ids that no longer exist.
  const saved = ids
    .map((id) => destinations.find((d) => d.id === id))
    .filter((d): d is DestinationSummary => d !== undefined);

  return (
    <div className="page-container pb-28">
      {!persistent && (
        <p role="alert" className="mb-8 max-w-[68ch] border-l-2 border-[#9a5b2c] bg-[#f6e8dc] px-5 py-4 text-[0.95rem] text-ink">
          This browser is blocking site storage, so saves will be lost when you close or reload this page.
        </p>
      )}

      {saved.length === 0 ? (
        <div className="border-t border-line pt-12">
          <h2 className="heading-card">Nothing saved yet</h2>
          <p className="mt-3 max-w-[56ch] text-ink-soft">
            Use the bookmark button on any destination to keep it here while you plan. It is a simple shortlist for this browser —
            nothing is booked or shared.
          </p>
          <Link
            href="/destinations"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink-soft"
          >
            Browse destinations
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          <p className="border-t border-line pt-6 text-muted" role="status" aria-live="polite">
            {saved.length === 1 ? "1 destination saved" : `${saved.length} destinations saved`}
          </p>
          <ul className="mt-6 divide-y divide-line border-b border-line">
            {saved.map((d) => (
              <li key={d.id} style={themeStyle(d.theme)} className="grid grid-cols-[6.5rem_1fr] gap-x-5 gap-y-4 py-6 sm:grid-cols-[10rem_1fr_auto] sm:items-center md:gap-x-8">
                <div className="relative aspect-[4/3] overflow-hidden bg-accent-wash">
                  <DestinationImage media={d.hero} sizes="160px" />
                </div>
                <div>
                  <p className="eyebrow text-muted">{CATEGORY_LABELS[d.category]}</p>
                  <h2 className="heading-card mt-1">
                    <Link href={`/destinations/${d.slug}`} className="hover:underline">
                      {d.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-[0.95rem] text-muted">{d.region}</p>
                </div>
                <div className="col-span-2 flex flex-wrap gap-3 sm:col-span-1">
                  <Link
                    href={`/destinations/${d.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-5 text-sm font-medium hover:border-ink"
                  >
                    Read guide
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    aria-label={`Remove ${d.name} from saved destinations`}
                    className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
