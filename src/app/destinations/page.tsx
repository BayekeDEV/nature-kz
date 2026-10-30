import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogueBrowser } from "@/components/catalogue/CatalogueBrowser";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { getDestinationSummaries } from "@/lib/destinations";
import { countWord } from "@/lib/format";

export const metadata: Metadata = {
  title: "All destinations",
  description: `Search and filter ${countWord(getDestinationSummaries().length)} natural destinations in Kazakhstan: lakes, canyons and rock formations, and dunes.`,
};

export default function DestinationsPage() {
  const summaries = getDestinationSummaries();

  return (
    <div className="page-glow pt-[var(--header-height)]">
      <header className="page-container pt-16 pb-10 md:pt-24 md:pb-14">
        <p className="eyebrow text-fg-muted">Catalogue</p>
        <h1 className="mt-4 font-display text-[clamp(2.75rem,2rem+3.5vw,5.5rem)] leading-[0.95] font-medium">All destinations</h1>
        <p className="mt-6 max-w-[60ch] text-[1.05rem] leading-relaxed text-fg-soft md:text-[1.125rem]">
          {countWord(summaries.length, true)} places, from chalk escarpments in the west to the lakes of the Tian Shan and the Altai
          and granite in the north. Search by name, region or landscape, or filter by type.
        </p>
      </header>

      {/* Static fallback while the URL-driven browser loads: the full, unfiltered list. */}
      <Suspense
        fallback={
          <div className="page-container pb-28">
            <ul className="grid gap-x-8 gap-y-16 border-t border-line pt-12 md:grid-cols-2 lg:grid-cols-3">
              {summaries.map((summary, index) => (
                <li key={summary.id}>
                  <DestinationCard destination={summary} index={index} headingLevel="h2" eager={index < 3} />
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <CatalogueBrowser destinations={summaries} />
      </Suspense>
    </div>
  );
}
