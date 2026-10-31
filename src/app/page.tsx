import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { PhotoHero } from "@/components/destination/PhotoHero";
import { StaticAtlas } from "@/components/map/StaticAtlas";
import { Reveal } from "@/components/motion/Reveal";
import { getAllDestinations, getFeaturedDestination, getHomeSelection, getMedia } from "@/lib/destinations";
import { countWord, heroFit } from "@/lib/format";
import { getAtlasPoints } from "@/lib/atlas-points";

export default function HomePage() {
  const featured = getFeaturedDestination();
  const hero = getMedia(featured, "hero");
  const destinations = getAllDestinations();
  const selection = getHomeSelection();
  const points = getAtlasPoints(destinations);

  return (
    <>
      <PhotoHero
        media={hero}
        placement={featured.heroPlacement}
        mobileTitlePlacement={featured.mobileTitlePlacement}
        eyebrow={<p className="eyebrow text-white/85">Featured destination · {featured.region}</p>}
        title={
          <h1 className="display-hero" style={{ "--fit": heroFit(featured.name) } as CSSProperties}>
            {featured.name}
          </h1>
        }
        credit={
          <>
            Photo: {hero.credit.author}, {hero.credit.license}
          </>
        }
        aside={
          <a
            href="#introduction"
            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.2em] text-white/75 uppercase hover:text-white lg:hero-wide:flex"
          >
            Scroll
            <ArrowDown className="size-4 motion-safe:animate-bounce" strokeWidth={1.5} aria-hidden />
          </a>
        }
      >
        <p className="mt-6 max-w-[34rem] text-[1.15rem] leading-relaxed text-white/90">{featured.intro}</p>
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

      {/* Phones: the featured destination's introduction follows the photograph. */}
      <section aria-label="Featured destination" className="page-container pt-1 pb-4 hero-wide:hidden">
        <p className="eyebrow text-fg-muted">Featured destination · {featured.region}</p>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-fg-soft">{featured.intro}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={`/destinations/${featured.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg px-6 text-[0.95rem] font-medium text-page transition hover:bg-white active:scale-[0.98]"
          >
            Explore {featured.name}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/destinations" className="inline-flex min-h-11 items-center border-b border-fg/40 text-[0.95rem] hover:border-fg">
            All destinations
          </Link>
        </div>
        <p className="mt-4 text-xs text-fg-muted">
          Photo: {hero.credit.author}, {hero.credit.license}
        </p>
      </section>

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
              This guide follows {countWord(destinations.length)} places that show that range: chalk escarpments and a valley of stone
              spheres in the west; mountain lakes, canyons and a singing dune in the Tian Shan; the long steppe lake of Balkhash; hills
              of rock and pine at Burabay and Bayanaul in the north; and the Altai of Katon-Karagay and Markakol in the far east.
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
                {countWord(destinations.length, true)} destinations
              </h2>
              <p className="mt-4 max-w-md text-fg-muted">A selection to start with. The catalogue and the map include every destination.</p>
            </div>
            <Link href="/destinations" className="inline-flex min-h-11 items-center gap-2 border-b border-fg/40 font-medium hover:border-fg">
              Explore all {destinations.length} destinations
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {selection.map((summary, index) => (
              <Reveal as="li" key={summary.id}>
                <DestinationCard destination={summary} index={index} />
              </Reveal>
            ))}
            <li className={`page-glow flex flex-col justify-between gap-8 border border-line p-8 md:p-10 ${CTA_SPAN_MD[selection.length % 2]} ${CTA_SPAN_LG[selection.length % 3]}`}>
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
              Six lie in the south and south-east, in the Tian Shan and its foothills. Bozzhyra, Aktolagay and Torysh are in the west,
              Burabay and Bayanaul in the north, Balkhash in the steppe between, and Katon-Karagay and Markakol in the Altai of the far
              east. Select a marker to open its guide.
            </p>
            <p className="mt-4 max-w-md text-sm text-fg-muted">
              Markers show published reference points, not routes, trailheads or access points.
            </p>
            <Link href="/map" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-fg/40 font-medium hover:border-fg">
              Explore the interactive atlas
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
          <Reveal>
            <StaticAtlas points={points} title="Map of Kazakhstan showing every destination" />
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
