"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { ResolvedMedia } from "@/lib/types";

interface Props {
  media: ResolvedMedia;
  sizes: string;
  /** Use for the one above-the-fold hero image per page. */
  priority?: boolean;
  className?: string;
  /** Light text on the placeholder for dark/photographic contexts. */
  tone?: "light" | "dark";
  /** "tall" always uses the portrait focal point (e.g. 4:5 cards). */
  crop?: "responsive" | "tall";
}

/**
 * Fills its (relatively positioned) parent with a photo, or with a calm
 * "Photo pending" panel when the file is missing or fails to load —
 * never a broken-image icon.
 */
export function DestinationImage({ media, sizes, priority = false, className = "", tone = "dark", crop = "responsive" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!media.available || failed) {
    return (
      <div
        role="img"
        aria-label={`${media.alt} (photo pending)`}
        className={`absolute inset-0 flex items-end bg-accent-wash ${className}`}
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 70% 20%, color-mix(in srgb, var(--t-accent) 24%, transparent), transparent 70%), linear-gradient(160deg, color-mix(in srgb, var(--t-accent) 14%, var(--t-bg)), color-mix(in srgb, var(--t-accent) 30%, var(--t-bg)))",
        }}
      >
        <span className={`eyebrow m-4 ${tone === "light" ? "text-white/85" : "text-accent-fg"}`}>Photo pending</span>
      </div>
    );
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={sizes}
      quality={82}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`object-cover object-[var(--focal-mobile)] ${crop === "responsive" ? "md:object-[var(--focal-desktop)]" : ""} ${className}`}
      style={
        {
          "--focal-mobile": media.focal.mobile,
          "--focal-desktop": media.focal.desktop,
        } as CSSProperties
      }
    />
  );
}
