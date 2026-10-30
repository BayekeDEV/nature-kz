import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { Gallery } from "@/components/destination/Gallery";
import { PhotoHero } from "@/components/destination/PhotoHero";
import { SaveButton } from "@/components/destination/SaveButton";
import { StaticAtlas } from "@/components/map/StaticAtlas";
import { Reveal } from "@/components/motion/Reveal";
import {
  getAllDestinations,
  getDestinationBySlug,
  getDestinationSlugs,
  getGalleryMedia,
  getMedia,
  getRelatedDestinations,
  toSummary,
} from "@/lib/destinations";
import { CATEGORY_LABELS } from "@/lib/filter";
import { formatDate, heroFit } from "@/lib/format";
import { formatCoordinates, osmPointUrl, osmSearchUrl } from "@/lib/map";
import { getAtlasPoints } from "@/lib/atlas-points";
import type { Destination, GuideSection } from "@/lib/types";

export function generateStaticParams() {
  return getDestinationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) return { title: "Destination not found" };
  return {
    title: `${destination.name} — ${destination.landscape}`,
    description: destination.summary,
  };
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();

  const hero = getMedia(destination, "hero");
  const gallery = getGalleryMedia(destination);
  const related = getRelatedDestinations(destination).map(toSummary);
  const sections: GuideSection[] = [destination.special, destination.history, destination.planning];
  const officialSource = destination.sources.find((s) => s.kind === "official-park") ?? destination.sources.find((s) => s.kind === "official-tourism");

  return (
    <article>
      <PhotoHero
        media={hero}
        placement={destination.heroPlacement}
        height="tall"
        credit={
          <>
            Photo: {hero.credit.author}, {hero.credit.license}
          </>
        }
      >
        <p className="eyebrow text-white/85">
          {CATEGORY_LABELS[destination.category]} · {destination.region}
        </p>
        <h1 className="display-hero mt-5" style={{ "--fit": heroFit(destination.name) } as CSSProperties}>
          {destination.name}
        </h1>
        <p className={`mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-white/90 md:text-[1.15rem] ${destination.heroPlacement === "right" ? "md:ml-auto" : ""}`}>
          {destination.intro}
        </p>
        <div className={`mt-8 flex flex-wrap items-center gap-4 ${destination.heroPlacement === "right" ? "md:justify-end" : ""}`}>
          <SaveButton id={destination.id} name={destination.name} variant="light" />
          <a href="#guide" className="inline-flex min-h-11 items-center border-b border-white/60 text-[0.98rem] hover:border-white">
            Read the guide
          </a>
        </div>
      </PhotoHero>

      {/* Quick facts rise out of the hero's fade on a slightly raised surface. */}
      <section aria-label="Quick facts" className="relative z-10 -mt-10 md:-mt-14">
        <dl className="page-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {destination.quickFacts.map((fact) => (
            <div key={fact.label} className="border-t border-accent/50 bg-raised/80 px-5 py-5 backdrop-blur-sm sm:border-l sm:border-l-line sm:first:border-l-0 lg:py-6">
              <dt className="text-[0.8rem] font-medium tracking-[0.06em] text-accent-fg uppercase">{fact.label}</dt>
              <dd className="mt-2 text-[1rem] leading-snug text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div id="guide" className="page-container pt-12 pb-16 md:pt-16 md:pb-24">
        <ContentNotice destination={destination} />
        <div className="space-y-16 md:space-y-20">
          {sections.map((section, index) => (
            <Reveal as="section" key={section.heading} className="grid gap-5 border-t border-line pt-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12 md:pt-12">
              <div>
                <p className="eyebrow tabular-nums text-accent-fg">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="heading-section mt-3 max-w-[12ch]">{section.heading}</h2>
              </div>
              <div>
                <div className="prose-guide">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
                {section === destination.planning && (
                  <aside className="mt-8 max-w-[68ch] border-l-2 border-accent bg-accent-wash/70 px-5 py-4 text-[0.95rem] leading-relaxed text-fg-soft">
                    <strong className="font-semibold text-fg">Changeable information.</strong> Access, fees, permits and road
                    conditions change. This guide was researched on {destination.verifiedOn ? formatDate(destination.verifiedOn) : "an unconfirmed date"}{" "}
                    and does not confirm that any route is currently open.
                    {officialSource && (
                      <>
                        {" "}
                        Check{" "}
                        <a href={officialSource.url} target="_blank" rel="noopener" className="font-medium text-fg underline underline-offset-2">
                          {officialSource.publisher}
                        </a>{" "}
                        before you travel.
                      </>
                    )}
                  </aside>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <section aria-labelledby="gallery-heading" className="band-raised py-20 md:py-28">
        <div className="page-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="gallery-heading" className="heading-section">
              Gallery
            </h2>
            <p className="text-sm text-fg-muted">Select a photo to view it full size.</p>
          </div>
          <div className="mt-10">
            <Gallery images={gallery} destinationName={destination.name} theme={destination.theme} />
          </div>
        </div>
      </section>

      <GeographicContext destination={destination} />

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="py-20 md:py-24">
          <div className="page-container">
            <h2 id="related-heading" className="heading-section">
              Related destinations
            </h2>
            <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {related.map((summary) => (
                <li key={summary.id}>
                  <DestinationCard destination={summary} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="sources-heading" className="band-raised py-20 md:py-24">
        <div className="page-container grid gap-8 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12">
          <div>
            <h2 id="sources-heading" className="heading-section">
              Sources
            </h2>
            {destination.verifiedOn && (
              <p className="mt-4 text-[0.95rem] text-fg-muted">Research carried out on {formatDate(destination.verifiedOn)}.</p>
            )}
          </div>
          <ol className="max-w-[68ch] divide-y divide-line border-y border-line">
            {destination.sources.map((source) => (
              <li key={source.id} className="py-4">
                <a href={source.url} target="_blank" rel="noopener" className="group inline-flex items-start gap-1 font-medium text-fg">
                  <span className="underline decoration-fg/35 underline-offset-4 group-hover:decoration-accent-fg">{source.title}</span>
                  <ArrowUpRight className="mt-1 size-4 shrink-0" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <p className="mt-1 text-sm text-fg-muted">
                  {source.publisher} · {SOURCE_KIND_LABELS[source.kind]} · accessed {formatDate(source.accessedOn)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  );
}

const SOURCE_KIND_LABELS = {
  "official-park": "Official park website",
  "official-tourism": "Official tourism portal",
  government: "Government publication",
  international: "International organisation",
  news: "News report",
  reference: "Reference work",
} as const;

function ContentNotice({ destination }: { destination: Destination }) {
  if (destination.status === "verified") return null;
  return (
    <p role="note" className="mb-12 max-w-[68ch] border border-accent bg-accent-wash px-5 py-4 text-[0.95rem] text-fg">
      <strong>Draft content.</strong> This guide has not yet been checked against sources. Treat it as a preview.
    </p>
  );
}

function GeographicContext({ destination }: { destination: Destination }) {
  const { coordinates } = destination;
  const points = getAtlasPoints(getAllDestinations());
  return (
    <section aria-labelledby="geo-heading" className="py-20 md:py-24">
      <div className="page-container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div>
          <h2 id="geo-heading" className="heading-section">
            Geographic context
          </h2>
          <p className="mt-5 max-w-md text-fg-soft">{destination.region}.</p>
          {coordinates ? (
            <dl className="mt-6 space-y-3 text-[0.98rem]">
              <div>
                <dt className="eyebrow text-fg-muted">Reference point</dt>
                <dd className="mt-1 font-medium tabular-nums">{formatCoordinates(coordinates)}</dd>
              </div>
              <div>
                <dt className="eyebrow text-fg-muted">What it marks</dt>
                <dd className="mt-1 text-fg-soft">{coordinates.represents}.</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-6 text-fg-soft">We have not yet verified a coordinate for this destination, so it is not plotted.</p>
          )}
          <p className="mt-6 max-w-md border-l-2 border-accent pl-4 text-sm leading-relaxed text-fg-muted">
            A map coordinate marks an attraction, not a trailhead or an approved access route. Follow park signage and official
            guidance on the ground.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {coordinates && (
              <a href={osmPointUrl(coordinates)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 font-medium underline underline-offset-4">
                View point on OpenStreetMap <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <a href={osmSearchUrl(destination.mapSearchQuery)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 font-medium underline underline-offset-4">
              Search on OpenStreetMap <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div>
          <StaticAtlas points={points} highlightSlug={destination.slug} title={`Map showing where ${destination.name} lies in Kazakhstan`} />
          <p className="mt-3 text-sm">
            <Link href={`/map#${destination.slug}`} className="underline underline-offset-4 hover:text-accent-fg">
              Explore {destination.name} on the interactive atlas
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
