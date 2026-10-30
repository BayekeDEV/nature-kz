import Image from "next/image";
import Link from "next/link";
import { ATLAS_FILES, STATIC_VIEW } from "@/content/atlas";
import { ATLAS_VIEWBOX, KAZAKHSTAN_OUTLINE_MERCATOR } from "@/content/atlas-outline.generated";
import { atlasCrop, atlasPosition, type AtlasPoint } from "@/lib/atlas";

interface Props {
  points: AtlasPoint[];
  title: string;
  /** Destination to emphasise (its guide page). Its name is always shown. */
  highlightSlug?: string;
  className?: string;
}

const { width: VW, height: VH } = ATLAS_VIEWBOX;
const crop = atlasCrop(STATIC_VIEW);
const pct = (value: number) => `${value * 100}%`;

/**
 * A light, non-interactive version of the atlas: the same relief image and
 * projection as the interactive map, cropped to Kazakhstan, with every
 * destination as a link to its guide. Used on the homepage and guide pages
 * (no WebGL), and as the fallback when the interactive map cannot start.
 */
export function StaticAtlas({ points, title, highlightSlug, className = "" }: Props) {
  return (
    <figure
      className={`relative isolate w-full overflow-hidden rounded-sm border border-line bg-[#16140f] ${className}`}
      style={{ aspectRatio: `${crop.width} / ${crop.height}` }}
    >
      {/* The full relief image, scaled and shifted so the cropped area fills the frame. */}
      <div
        className="absolute"
        style={{ left: pct(-crop.x / crop.width), top: pct(-crop.y / crop.height), width: pct(VW / crop.width), height: pct(VH / crop.height) }}
      >
        <Image
          src={ATLAS_FILES.reliefPreview}
          alt=""
          fill
          sizes="(min-width: 1280px) 1700px, 140vw"
          quality={82}
          loading="lazy"
          className="object-fill"
        />
      </div>
      <svg viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {/* Dim everything outside Kazakhstan, then draw its border. */}
        <path d={`M0 0H${VW}V${VH}H0Z ${KAZAKHSTAN_OUTLINE_MERCATOR}`} fillRule="evenodd" fill="#13110d" fillOpacity={0.42} />
        <path d={KAZAKHSTAN_OUTLINE_MERCATOR} fill="none" stroke="#0f0d0a" strokeOpacity={0.5} strokeWidth={3.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <path d={KAZAKHSTAN_OUTLINE_MERCATOR} fill="none" stroke="#efe6d6" strokeOpacity={0.85} strokeWidth={1.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <figcaption className="sr-only">{title}</figcaption>
      <a
        href="https://www.naturalearthdata.com/"
        target="_blank"
        rel="noopener"
        className="absolute right-1.5 bottom-1 z-[3] text-[0.65rem] text-[#fbf6ec]/75 hover:text-[#fbf6ec]"
      >
        Natural Earth
      </a>
      <ul aria-label={title}>
        {points.map((point) => {
          const { x, y } = atlasPosition(point.coordinates.lat, point.coordinates.lon);
          const left = (x - crop.x) / crop.width;
          const highlighted = point.slug === highlightSlug;
          // Labels open towards the middle of the map so they never run off the edge.
          const labelSide = left > 0.62 ? "right-full mr-1" : "left-full ml-1";
          return (
            <li key={point.slug} className="absolute" style={{ left: pct(left), top: pct((y - crop.y) / crop.height), zIndex: highlighted ? 2 : 1 }}>
              <Link
                href={`/destinations/${point.slug}`}
                aria-label={`${point.name}, ${point.region}${highlighted ? " (this guide)" : ""}`}
                aria-current={highlighted ? "page" : undefined}
                className="group absolute top-0 left-0 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none"
              >
                <span
                  aria-hidden
                  className={`block rounded-full border-2 shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-[#fbf6ec] group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-[#14110d] ${
                    highlighted ? "size-4 border-[#fbf6ec] ring-4 ring-[#fbf6ec]/30" : "size-3 border-[#14110d]"
                  }`}
                  style={{ backgroundColor: point.accent }}
                />
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-sm bg-[#14110d]/85 px-1.5 py-0.5 text-[0.78rem] leading-tight font-medium whitespace-nowrap text-[#fbf6ec] ${labelSide} ${
                    highlighted ? "" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  {point.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
