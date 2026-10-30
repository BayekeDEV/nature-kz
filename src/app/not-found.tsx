import Link from "next/link";
import { getAllDestinations } from "@/lib/destinations";
import { countWord } from "@/lib/format";

export default function NotFound() {
  const destinations = getAllDestinations();
  return (
    <div className="page-glow"><div className="page-container pt-[calc(var(--header-height)+4rem)] pb-28 md:pt-[calc(var(--header-height)+6rem)]">
      <p className="eyebrow text-fg-muted">Page not found</p>
      <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.5rem,2rem+3vw,5rem)] leading-[0.98] font-medium">
        This page isn&rsquo;t part of the guide
      </h1>
      <p className="mt-6 max-w-[56ch] text-[1.05rem] leading-relaxed text-fg-soft">
        The address may be mistyped, or the destination may not be covered yet. These are the {countWord(destinations.length)} destinations currently in the
        guide:
      </p>
      <ul className="mt-10 grid max-w-3xl gap-x-10 border-t border-line sm:grid-cols-2">
        {destinations.map((d) => (
          <li key={d.id} className="border-b border-line">
            <Link href={`/destinations/${d.slug}`} className="flex min-h-14 items-center justify-between gap-4 py-3 hover:text-accent-fg">
              <span className="font-display text-[1.5rem]">{d.name}</span>
              <span className="text-sm text-fg-muted">{d.landscape}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-fg px-6 font-medium text-page hover:bg-fg-soft">
          Go to the homepage
        </Link>
        <Link href="/destinations" className="inline-flex min-h-12 items-center border-b border-fg/40 font-medium hover:border-fg">
          Search the catalogue
        </Link>
      </div>
    </div>
    </div>
  );
}
