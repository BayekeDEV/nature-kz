import type { Metadata } from "next";
import Link from "next/link";
import { getPhotoCreditsByDestination } from "@/lib/destinations";
import type { ImageRole } from "@/lib/types";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Author, licence and source for every photograph used in NATURE KZ, grouped by destination.",
};

const ROLE_LABELS: Record<ImageRole, string> = {
  hero: "Main photo",
  "gallery-01": "Gallery 1",
  "gallery-02": "Gallery 2",
  "gallery-03": "Gallery 3",
};

/** Joins names as "A", "A and B" or "A, B and C". */
function listNames(names: string[]) {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

export default function PhotoCreditsPage() {
  const groups = getPhotoCreditsByDestination();
  // Describe the sources that are actually in use rather than assuming one:
  // "Wikimedia Commons (from Flickr)" counts as Commons, with Flickr as an origin.
  const vias = groups.flatMap((g) => g.photos.map((p) => p.credit.via));
  const platforms = [...new Set(vias.map((via) => via.replace(/ \(from .+\)$/, "")))];
  const origins = [...new Set(vias.flatMap((via) => via.match(/ \(from (.+)\)$/)?.[1] ?? []))];
  const total = groups.reduce((sum, g) => sum + g.photos.length, 0);

  return (
    <div className="page-glow pt-[var(--header-height)]">
      <header className="page-container pt-16 pb-10 md:pt-24 md:pb-14">
        <p className="eyebrow text-fg-muted">Credits</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,1.9rem+3vw,4.75rem)] leading-[0.95] font-medium">Photo credits</h1>
        <div className="mt-6 max-w-[64ch] space-y-3 text-[1rem] leading-relaxed text-fg-soft">
          <p>
            The {total} photographs on this site are used under the licences below. They come from {listNames(platforms)}
            {origins.length > 0 && <> (some first published on {listNames(origins)})</>}, where each file&rsquo;s author, licence and
            description were checked.
          </p>
          <p className="text-fg-muted">
            Every file was resized and recompressed for the web. Any other change, such as a crop, is noted beside the photo.
          </p>
        </div>
      </header>

      <div className="page-container pb-28">
        <div className="grid gap-x-12 gap-y-12 border-t border-line pt-10 md:grid-cols-2">
          {groups.map((group) => (
            <section key={group.slug} aria-labelledby={`credits-${group.slug}`}>
              <h2 id={`credits-${group.slug}`} className="font-display text-[1.45rem] leading-tight text-fg">
                <Link href={`/destinations/${group.slug}`} className="underline-offset-4 hover:underline">
                  {group.name}
                </Link>
              </h2>
              <ul className="mt-3 divide-y divide-line border-y border-line text-[0.92rem] leading-snug">
                {group.photos.map((photo) => (
                  <li key={photo.src} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-2.5">
                    <span className="text-fg-muted">{ROLE_LABELS[photo.role]}</span>
                    <span className="text-fg-soft">
                      {photo.credit.author} ·{" "}
                      {photo.credit.licenseUrl ? (
                        <a href={photo.credit.licenseUrl} target="_blank" rel="license noopener" className="underline underline-offset-2 hover:text-fg">
                          {photo.credit.license}
                        </a>
                      ) : (
                        photo.credit.license
                      )}{" "}
                      ·{" "}
                      <a href={photo.credit.sourceUrl} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-fg">
                        {photo.credit.via}
                      </a>
                      {photo.credit.changes && <span className="block text-fg-muted">{photo.credit.changes}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
