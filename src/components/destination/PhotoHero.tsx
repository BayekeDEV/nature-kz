"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { DestinationImage } from "@/components/media/DestinationImage";
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

/**
 * Full-bleed photographic hero shared by the homepage and every guide.
 * Motion is a slow 2D drift (translate + slight zoom) tied to scroll — no
 * fake depth — and it is switched off for reduced-motion users.
 */
export function PhotoHero({ media, placement, children, credit, aside, height = "full" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Reduced motion keeps the same starting values (so server and client HTML
  // match) but flattens the range, so the photo never moves.
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["0%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1.04, 1.04] : [1.04, 1.12]);

  return (
    <section
      ref={ref}
      data-hero
      className={`on-dark relative isolate flex overflow-hidden bg-night text-white ${
        height === "full" ? "min-h-[max(36rem,100svh)]" : "min-h-[max(34rem,88svh)]"
      }`}
    >
      <motion.div className="absolute inset-0 -z-20 origin-center" style={{ y, scale }}>
        <DestinationImage media={media} sizes="100vw" priority tone="light" />
      </motion.div>

      {/* Contrast only where the text sits: bottom edge plus the text side. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 via-45% to-transparent" />
      <div
        aria-hidden
        className={`absolute inset-y-0 -z-10 hidden w-2/3 md:block ${
          placement === "left" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"
        } from-black/40 to-transparent`}
      />

      <div
        className={`page-container relative flex flex-col justify-end pt-32 pb-14 md:pb-20 ${
          placement === "right" ? "md:items-end md:text-right" : ""
        }`}
      >
        <div className="hero-enter max-w-[62rem] [text-shadow:0_1px_24px_rgb(0_0_0/0.35)]">{children}</div>
      </div>

      {aside}
      {credit && (
        <p className="absolute right-[var(--gutter)] bottom-4 hidden max-w-xs text-right text-xs text-white/70 md:block">{credit}</p>
      )}
    </section>
  );
}
