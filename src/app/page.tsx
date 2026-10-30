import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { PhotoHero } from "@/components/destination/PhotoHero";
import { DestinationMap } from "@/components/map/DestinationMap";
import { Reveal } from "@/components/motion/Reveal";
import { getAllDestinations, getDestinationSummaries, getFeaturedDestination, getMedia } from "@/lib/destinations";
import { countWord, heroFit } from "@/lib/format";
import { getMapPoints } from "@/lib/map-points";

export default function HomePage() {
  const featured = getFeaturedDestination();
  const hero = getMedia(featured, "hero");
  const summaries = getDestinationSummaries();
  const points = getMapPoints(getAllDestinations());

  return (
    <>
      <PhotoHero
        media={hero}
        placement={featured.heroPlacement}
        credit={
          <>
            Photo: {hero.credit.author}, {hero.credit.license}
          </>
        }
        aside={
          <a
            href="#introduction"
            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.2em] text-white/75 uppercase hover:text-white lg:flex"
          >
            Scroll
            <ArrowDown className="size-4 motion-safe:animate-bounce" strokeWidth={1.5} aria-hidden />
          </a>
        }
      >
        <p className="eyebrow text-white/85">Featured destination · {featured.region}</p>
        <h1 className="display-hero mt-5" style={{ "--fit": heroFit(featured.name) } as CSSProperties}>
          {featured.name}
        </h1>
        <p className="mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-white/90 md:text-[1.15rem]">{featured.intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href={`/destinations/${featured.slug}`}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-fg px-7 text-[0.98rem] font-medium text-page [text-shadow:none] transition hover:bg-white active:scale-[0.98]"
          >
            Explore {featured.name}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/destinations" className="inline-flex min-h-11 items-center border-b border-white/60 text-[0.98rem] hover:border-white">
            Discover all destinations
          </Link>
        </div>
      </PhotoHero>

      <section id="introduction" aria-labelledby="intro-heading" className="page-container pt-12 pb-20 md:pt-16 md:pb-28">
        <Reveal className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
          <div>
            <p className="eyebrow text-fg-muted">Kazakhstan&rsquo;s landscapes</p>
            <h2 id="intro-heading" className="heading-section mt-4">
              From an ancient sea floor to the edge of the Tian Shan
            </h2>
          </div>
          <div className="prose-guide border-t border-line pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-12">
            <p>
              Kazakhstan stretches from the Caspian lowlands in the west to the Altai and Tian Shan mountains in the east and south.
              Between them lie desert plateaus, sand country, river canyons and the granite hills of the north.
            </p>
            <p>
              This guide follows {countWord(summaries.length)} places that show that range: chalk escarpments on the Ustyurt and
              Aktolagay plateaus in the west, forested lakes and a drowned forest in the Tian Shan, a red-rock canyon, a singing dune,
              a lake of pine and granite in the north, and Markakol in the Altai of the far east.
            </p>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="collection-heading" className="pb-24 md:pb-32">
        <div className="page-container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-fg-muted">The collection</p>
              <h2 id="collection-heading" className="heading-section mt-4">
                {countWord(summaries.length, true)} destinations
              </h2>
            </div>
            <Link href="/destinations" className="inline-flex min-h-11 items-center gap-2 border-b border-fg/40 font-medium hover:border-fg">
              Search the full catalogue
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {summaries.map((summary, index) => (
              <Reveal as="li" key={summary.id}>
                <DestinationCard destination={summary} index={index} />
              </Reveal>
            ))}
            <li className={`page-glow flex flex-col justify-between gap-8 border border-line p-8 md:p-10 ${CTA_SPAN_MD[summaries.length % 2]} ${CTA_SPAN_LG[summaries.length % 3]}`}>
              <p className="font-display text-[clamp(1.8rem,1.4rem+1.4vw,2.75rem)] leading-tight text-fg">
                Search by name, landscape or region, and filter lakes, canyons and dunes.
              </p>
              <Link
                href="/destinations"
                className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-fg/40 px-6 font-medium hover:border-fg hover:bg-fg hover:text-page"
              >
                Open the catalogue
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="map-heading" className="band-raised py-24 md:py-32">
        <div className="page-container grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-center">
          <Reveal>
            <p className="eyebrow text-fg-muted">Where they are</p>
            <h2 id="map-heading" className="heading-section mt-4">
              {countWord(points.length, true)} places across a vast country
            </h2>
            <p className="mt-6 max-w-md text-fg-soft">
              Five lie in the south-east, within reach of Almaty. Bozzhyra and Aktolagay are in the west, Burabay is in the north,
              and Markakol is in the Altai of the far east. Select a marker or a name to see where each one is.
            </p>
            <p className="mt-4 max-w-md text-sm text-fg-muted">
              Schematic overview only. Markers show published reference points, not routes, trailheads or access points.
            </p>
            <Link href="/map" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-fg/40 font-medium hover:border-fg">
              Open the map overview
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
          <Reveal>
            <DestinationMap points={points} showList title="Map of Kazakhstan showing every destination" />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="about-heading" className="page-container py-24 md:py-32">
        <Reveal className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
          <h2 id="about-heading" className="heading-section">
            About this guide
          </h2>
          <div className="prose-guide">
            <p>
              NATURE KZ is an independent editorial project introducing international visitors to Kazakhstan&rsquo;s natural
              landscapes. Each guide is written from official park and tourism sources and reference works, with every source listed
              and dated. We do not sell tours or bookings, and we point you to official information for anything that can change, such
              as access, fees and permits.
            </p>
            <p>
              <Link href="/about#methodology" className="font-medium text-fg underline underline-offset-4 hover:no-underline">
                Read how the guides are researched
              </Link>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* The catalogue tile fills whatever is left of the last grid row (2 columns on tablets, 3 on desktops). */
const CTA_SPAN_MD = ["md:col-span-2", "md:col-span-1"];
const CTA_SPAN_LG = ["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];
