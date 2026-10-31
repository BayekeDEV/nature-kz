"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { DestinationImage } from "@/components/media/DestinationImage";
import { coverSizes, HERO_FRAMES } from "@/lib/image-sizes";
import type { MobileTitlePlacement, ResolvedMedia } from "@/lib/types";

interface Props {
  media: ResolvedMedia;
  placement: "left" | "right";
  /** Where the title sits on phones, chosen per photograph. */
  mobileTitlePlacement: MobileTitlePlacement;
  /** The page heading. The only text shown over the photo on phones. */
  title: ReactNode;
  /** Small line above the title (wide screens only). */
  eyebrow?: ReactNode;
  /** Intro and actions below the title (wide screens only; pages repeat them below the hero for phones). */
  children?: ReactNode;
  /** Small credit line shown in the corner of the photograph (wide screens only). */
  credit?: ReactNode;
  /** Optional element for the bottom edge, e.g. a scroll cue. */
  aside?: ReactNode;
  height?: "full" | "tall";
}

const finePointerQuery = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const subscribeFinePointer = (onChange: () => void) => {
  const query = window.matchMedia(finePointerQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/* Phone layout: the title's vertical position comes from the destination's data. */
const MOBILE_JUSTIFY: Record<MobileTitlePlacement, string> = {
  top: "justify-start pt-[calc(var(--header-height)+1.25rem)] pb-16",
  center: "justify-center pt-[var(--header-height)] pb-16",
  bottom: "justify-end pt-32 pb-14",
};

/**
 * Full-bleed photographic hero shared by the homepage and every guide.
 *
 * Two compositions, switched by available space (the `hero-wide` variant:
 * at least 768 px wide and 600 px tall) rather than by device type:
 * - Phones, in either orientation: the photo fills about one screen and only
 *   the destination name sits on it, at a per-destination position, with a
 *   local scrim. Everything else follows the hero in normal page flow.
 * - Wider and taller screens: the full editorial composition with eyebrow,
 *   intro and actions, and a 2D parallax drift on fine pointers.
 * Both use CSS only for layout, so there is no flash of the wrong crop or
 * layout while the page hydrates. Movement is off for reduced-motion users.
 */
export function PhotoHero({ media, placement, mobileTitlePlacement, title, eyebrow, children, credit, aside, height = "full" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const finePointer = useSyncExternalStore(subscribeFinePointer, () => window.matchMedia(finePointerQuery).matches, () => false);
  const moves = finePointer && !reduceMotion;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Same starting value in every case, so server and client HTML always match.
  const y = useTransform(scrollYProgress, [0, 1], moves ? ["0%", "7%"] : ["0%", "0%"]);
  const right = placement === "right";

  return (
    <section
      ref={ref}
      data-hero
      className={`on-photo hero-height relative isolate flex overflow-hidden bg-page text-white ${height === "full" ? "hero-height-full" : "hero-height-tall"}`}
    >
      {/* Overscan: 8% extra above the frame, so the downward drift never exposes an edge. */}
      <motion.div className="absolute inset-x-0 -top-[8%] bottom-0 -z-20" style={{ y }}>
        <DestinationImage media={media} sizes={coverSizes(media, HERO_FRAMES)} priority tone="light" />
      </motion.div>

      <div aria-hidden className="hero-top-shade absolute inset-x-0 top-0 -z-10 h-40" />
      {/* Phones: shade only where the title sits. Wide screens: shade behind the text block. */}
      <div aria-hidden className={`hero-title-scrim-${mobileTitlePlacement} absolute inset-x-0 -z-10 hero-wide:hidden ${SCRIM_AREA[mobileTitlePlacement]}`} />
      <div aria-hidden className={`hero-scrim-${placement} absolute inset-0 -z-10 hidden hero-wide:block`} />
      <div aria-hidden className="hero-fade absolute inset-x-0 -bottom-px -z-10 h-[22%] hero-wide:h-[38%]" />

      <div
        className={`page-container relative flex flex-col ${MOBILE_JUSTIFY[mobileTitlePlacement]} hero-wide:justify-end hero-wide:pt-32 hero-wide:pb-24 ${
          right ? "hero-wide:items-end hero-wide:text-right" : ""
        }`}
      >
        <div className="hero-enter max-w-[62rem] text-[color-mix(in_srgb,var(--t-text)_40%,white)]">
          {eyebrow && <div className="mb-5 hidden hero-wide:block">{eyebrow}</div>}
          {title}
          {children && <div className="hidden hero-wide:block">{children}</div>}
        </div>
      </div>

      {aside}
      {credit && (
        <p className="absolute top-[calc(var(--header-height)+0.75rem)] right-[var(--gutter)] hidden max-w-xs text-right text-xs text-white/80 [text-shadow:0_1px_8px_rgb(0_0_0/0.6)] hero-wide:block">
          {credit}
        </p>
      )}
    </section>
  );
}

const SCRIM_AREA: Record<MobileTitlePlacement, string> = {
  top: "top-0 h-[45%]",
  center: "inset-y-0",
  bottom: "bottom-0 h-[45%]",
};
