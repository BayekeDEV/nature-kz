import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DestinationMap } from "@/components/map/DestinationMap";
import { getAllDestinations } from "@/lib/destinations";
import { formatCoordinates, osmPointUrl, osmSearchUrl } from "@/lib/map";
import { getMapPoints } from "@/lib/map-points";

export const metadata: Metadata = {
  title: "Map overview",
  description: "A schematic overview of where the NATURE KZ destinations lie within Kazakhstan, with every destination marked individually.",
};

export default function MapPage() {
  const destinations = getAllDestinations();
  const points = getMapPoints(destinations);
  const unplotted = destinations.filter((d) => !d.coordinates);

  return (
    <div className="page-glow pt-[var(--header-height)]">
      <header className="page-container pt-16 pb-8 md:pt-24">
        <p className="eyebrow text-fg-muted">Map</p>
        <h1 className="mt-4 font-display text-[clamp(2.75rem,2rem+3.5vw,5.5rem)] leading-[0.95] font-medium">Where the destinations are</h1>
        <p className="mt-6 max-w-[62ch] text-[1.05rem] leading-relaxed text-fg-soft">
          A schematic overview for orientation, not navigation. Each marker is a published reference point for the destination, taken
          from the source listed beside it. It is not a trailhead, car park or approved access route.
        </p>
      </header>

      <section aria-label="Schematic map" className="page-container">
        <DestinationMap points={points} showList title="Map of Kazakhstan showing every destination" />
      </section>

      <section aria-labelledby="list-heading" className="page-container py-20">
        <h2 id="list-heading" className="heading-section">
          Reference points
        </h2>
        <ol className="mt-10 divide-y divide-line border-y border-line">
          {destinations.map((d, index) => {
            const source = d.coordinates ? d.sources.find((s) => s.id === d.coordinates?.sourceId) : undefined;
            return (
              <li key={d.id} className="grid gap-4 py-6 md:grid-cols-[3rem_minmax(0,1.2fr)_minmax(0,1.6fr)_auto] md:items-start md:gap-8">
                <span className="font-display text-2xl tabular-nums" style={{ color: d.theme.accentText }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="heading-card">
                    <Link href={`/destinations/${d.slug}`} className="hover:underline">
                      {d.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[0.95rem] text-fg-muted">{d.region}</p>
                </div>
                <div className="text-[0.95rem] text-fg-soft">
                  {d.coordinates ? (
                    <>
                      <p className="font-medium tabular-nums text-fg">{formatCoordinates(d.coordinates)}</p>
                      <p className="mt-1">{d.coordinates.represents}.</p>
                      {source && (
                        <p className="mt-1 text-sm text-fg-muted">
                          Source:{" "}
                          <a href={source.url} target="_blank" rel="noopener" className="underline">
                            {source.publisher}
                          </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <p>No verified coordinate yet — use the map search link.</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-[0.95rem]">
                  {d.coordinates && (
                    <a href={osmPointUrl(d.coordinates)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 underline underline-offset-4">
                      OpenStreetMap <ArrowUpRight className="size-4" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                  <a href={osmSearchUrl(d.mapSearchQuery)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 underline underline-offset-4">
                    Search by name <ArrowUpRight className="size-4" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
        {unplotted.length > 0 && (
          <p className="mt-6 text-sm text-fg-muted">Not plotted: {unplotted.map((d) => d.name).join(", ")}.</p>
        )}
      </section>
    </div>
  );
}
