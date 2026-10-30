"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { DestinationImage } from "@/components/media/DestinationImage";
import { coverSizes, HERO_FRAMES } from "@/lib/image-sizes";
import type { ResolvedMedia } from "@/lib/types";

interface Props {
  media: ResolvedMedia;
  placement: "left" | "right";
  children: ReactNode;
  /** Small credit line shown in the corner of the photograph. */
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

/**
 * Full-bleed photographic hero shared by the homepage and every guide.
 *
 * - The photo sits in a slightly taller layer (overscan) and drifts down a
 *   little as you scroll: a 2D parallax, with no zoom that would soften it.
 * - Its lower part fades into the theme background (`--t-bg`), so the page
 *   continues out of the photograph instead of starting at a hard edge.
 * - Contrast comes from a scrim behind the text only, not a grey wash over the
 *   whole picture.
 * Movement is off for reduced-motion users and on touch or small screens.
 */
export function PhotoHero({ media, placement, children, credit, aside, height = "full" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const finePointer = useSyncExternalStore(subscribeFinePointer, () => window.matchMedia(finePointerQuery).matches, () => false);
  const moves = finePointer && !reduceMotion;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Same starting value in every case, so server and client HTML always match.
  const y = useTransform(scrollYProgress, [0, 1], moves ? ["0%", "7%"] : ["0%", "0%"]);

  return (
    <section
      ref={ref}
      data-hero
      className={`on-photo relative isolate flex overflow-hidden bg-page text-white ${
        height === "full" ? "min-h-[max(36rem,100svh)]" : "min-h-[max(34rem,92svh)]"
      }`}
    >
      {/* Overscan: 8% extra above the frame, so the downward drift never exposes an edge. */}
      <motion.div className="absolute inset-x-0 -top-[8%] bottom-0 -z-20" style={{ y }}>
        <DestinationImage media={media} sizes={coverSizes(media, HERO_FRAMES)} priority tone="light" />
      </motion.div>

      <div aria-hidden className="hero-top-shade absolute inset-x-0 top-0 -z-10 h-40" />
      <div aria-hidden className={`hero-scrim-${placement} absolute inset-0 -z-10`} />
      <div aria-hidden className="hero-fade absolute inset-x-0 -bottom-px -z-10 h-[38%]" />

      <div
        className={`page-container relative flex flex-col justify-end pt-32 pb-16 md:pb-24 ${
          placement === "right" ? "md:items-end md:text-right" : ""
        }`}
      >
        <div className="hero-enter max-w-[62rem] text-[color-mix(in_srgb,var(--t-text)_40%,white)]">{children}</div>
      </div>

      {aside}
      {credit && (
        <p className="absolute top-[calc(var(--header-height)+0.75rem)] right-[var(--gutter)] hidden max-w-xs text-right text-xs text-white/80 [text-shadow:0_1px_8px_rgb(0_0_0/0.6)] md:block">{credit}</p>
      )}
    </section>
  );
}
