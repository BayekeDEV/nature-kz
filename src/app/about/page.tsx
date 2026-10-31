import type { Metadata } from "next";
import Link from "next/link";
import { getAllDestinations } from "@/lib/destinations";
import { countWord, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "About & methodology",
  description: "Why NATURE KZ exists and how its guides to Kazakhstan's natural landscapes are researched.",
};

export default function AboutPage() {
  const destinations = getAllDestinations();

  return (
    <div className="page-glow pt-[var(--header-height)]">
      <header className="page-container pt-16 pb-12 md:pt-24">
        <p className="eyebrow text-fg-muted">About</p>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.75rem,2rem+3.5vw,5.5rem)] leading-[0.95] font-medium">
          A careful guide to Kazakhstan&rsquo;s landscapes
        </h1>
      </header>

      <div className="page-container space-y-20 pb-28 md:space-y-28">
        <section aria-labelledby="purpose-heading" className="grid gap-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12">
          <h2 id="purpose-heading" className="heading-section">
            Purpose
          </h2>
          <div className="prose-guide">
            <p>
              NATURE KZ introduces international visitors to {countWord(destinations.length)} natural destinations in Kazakhstan through photography and short,
              sourced guides. It is an independent editorial project: it does not sell tours, take bookings or speak for any park or
              government body.
            </p>
            <p>
              The aim is to explain what makes each place distinctive, where it is, and what to check before visiting — without
              inventing details that a reader might rely on.
            </p>
          </div>
        </section>

        <section id="methodology" aria-labelledby="method-heading" className="grid gap-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12">
          <h2 id="method-heading" className="heading-section">
            Sources &amp; methodology
          </h2>
          <div className="prose-guide">
            <p>
              Each guide is written from official national park websites and the national tourism portal wherever these were
              available, supported by reference works and dated news reports. Every guide lists its sources and the date they were
              read.
            </p>
            <p>
              We separate stable facts — geography, natural features and established history — from information that changes, such
              as fees, road access, permits and seasonal closures. Changeable details are never presented as current; each guide
              points to the official source to check instead. Where sources disagree on numbers, we leave the numbers out or name the
              source we follow. Legends are labelled as legends.
            </p>
            <p>
              Map markers are reference points published by the cited source. They are not trailheads or approved access routes.
            </p>
            <ul className="mt-8 divide-y divide-line border-y border-line text-[1rem]">
              {destinations.map((d) => (
                <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                  <Link href={`/destinations/${d.slug}#sources-heading`} className="font-medium text-fg underline-offset-4 hover:underline">
                    {d.name}
                  </Link>
                  <span className="text-sm text-fg-muted">
                    {d.sources.length} sources · {d.verifiedOn ? `researched ${formatDate(d.verifiedOn)}` : "draft, not yet verified"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="credits-heading" className="grid gap-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12">
          <h2 id="credits-heading" className="heading-section">
            Photographs
          </h2>
          <p className="prose-guide">
            Every photograph is used under its own licence, credited to its author. The full list is on the{" "}
            <Link href="/photo-credits" className="underline">
              photo credits
            </Link>{" "}
            page.
          </p>
        </section>

        <section aria-labelledby="map-credit-heading" className="grid gap-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12">
          <h2 id="map-credit-heading" className="heading-section">
            Map data
          </h2>
          <p className="prose-guide">
            The atlas relief, land cover, borders, lakes and rivers come from{" "}
            <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener" className="underline">
              Natural Earth
            </a>
            , which is in the public domain. Finer relief when zoomed in comes from{" "}
            <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener" className="underline">
              Terrain Tiles
            </a>{" "}
            (Mapzen, AWS Open Data): SRTM and GMTED2010 courtesy of the U.S. Geological Survey, ETOPO1 courtesy of NOAA.
            Map labels use the Open Sans typeface. External map links open OpenStreetMap.
          </p>
        </section>
      </div>
    </div>
  );
}
