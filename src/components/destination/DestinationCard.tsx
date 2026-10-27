import Link from "next/link";
import { DestinationImage } from "@/components/media/DestinationImage";
import { SaveButton } from "@/components/destination/SaveButton";
import { CATEGORY_LABELS } from "@/lib/filter";
import { themeStyle } from "@/lib/format";
import type { DestinationSummary } from "@/lib/types";

interface Props {
  destination: DestinationSummary;
  index?: number;
  headingLevel?: "h2" | "h3";
}

/**
 * The whole card is clickable through a stretched link on the title, while the
 * save button stays a separate control layered above it (no nested buttons in
 * links).
 */
export function DestinationCard({ destination: d, index, headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex flex-col" style={themeStyle(d.theme)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-accent-wash md:aspect-[4/5]">
        <DestinationImage
          media={d.hero}
          crop="tall"
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw"
          className="transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <SaveButton id={d.id} name={d.name} variant="overlay" className="absolute top-3 right-3 z-20" />
      </div>

      <div className="mt-5 flex flex-1 flex-col border-t border-line pt-4">
        <p className="eyebrow flex items-center gap-3 text-muted">
          {index !== undefined && <span className="tabular-nums text-accent-deep">{String(index + 1).padStart(2, "0")}</span>}
          <span>{CATEGORY_LABELS[d.category]}</span>
        </p>
        <Heading className="heading-card mt-2 text-ink">
          <Link
            href={`/destinations/${d.slug}`}
            className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent-deep"
          >
            {d.name}
          </Link>
        </Heading>
        <p className="mt-1 text-[0.95rem] text-muted">{d.region}</p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{d.summary}</p>
        <p className="mt-4 text-sm font-medium text-accent-deep">
          <span className="border-b border-current pb-0.5 transition-colors group-hover:border-transparent">Read the guide</span>
          <span aria-hidden> →</span>
        </p>
      </div>
    </article>
  );
}
