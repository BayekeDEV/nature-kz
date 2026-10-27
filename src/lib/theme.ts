import type { CSSProperties } from "react";
import type { DestinationTheme } from "@/lib/types";

/**
 * Shared "brand" theme for pages that do not belong to one destination
 * (home, catalogue, map, about, saved): warm stone, close to Bozzhyra so the
 * homepage hero flows into the rest of the page.
 */
export const BRAND_THEME: DestinationTheme = {
  bg: "#1B1814",
  surface: "#25211B",
  text: "#EDE6DA",
  muted: "#B7AC9B",
  accent: "#C2A06A",
  accentText: "#D9BD8C",
  border: "#3B352C",
};

/** Turns theme tokens into the CSS variables used by globals.css. */
export function themeVars(theme: DestinationTheme): CSSProperties {
  return {
    "--t-bg": theme.bg,
    "--t-surface": theme.surface,
    "--t-text": theme.text,
    "--t-muted": theme.muted,
    "--t-accent": theme.accent,
    "--t-accent-text": theme.accentText,
    "--t-border": theme.border,
  } as CSSProperties;
}

/** Only the accent variables — lets a card show its destination's accent on any page. */
export function accentVars(theme: DestinationTheme): CSSProperties {
  return { "--t-accent": theme.accent, "--t-accent-text": theme.accentText } as CSSProperties;
}

/** Picks the theme for a URL path: a destination guide's own theme, else the brand theme. */
export function themeForPath(pathname: string, themes: Record<string, DestinationTheme>): DestinationTheme {
  const match = pathname.match(/^\/destinations\/([^/?#]+)\/?$/);
  return (match && themes[match[1]]) || BRAND_THEME;
}

/* ---- Colour maths (used by the contrast tests) ---- */

function channels(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

/** Mixes two hex colours like CSS `color-mix(in srgb, a weight, b)`. */
export function mix(a: string, b: string, weight: number): string {
  const [ca, cb] = [channels(a), channels(b)];
  return `#${ca.map((v, i) => Math.round(v * weight + cb[i] * (1 - weight)).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours (1–21). */
export function contrast(a: string, b: string) {
  const [la, lb] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (la + 0.05) / (lb + 0.05);
}

/** Body paragraphs use text softened toward the background (see --color-fg-soft). */
export const SOFT_TEXT_WEIGHT = 0.86;
