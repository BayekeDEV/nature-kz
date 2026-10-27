import { describe, expect, it } from "vitest";
import { getAllDestinations } from "@/lib/destinations";
import { BRAND_THEME, contrast, mix, SOFT_TEXT_WEIGHT, themeForPath } from "@/lib/theme";

const themes = [
  { name: "brand", theme: BRAND_THEME },
  ...getAllDestinations().map((d) => ({ name: d.slug, theme: d.theme })),
];

describe("theme contrast (WCAG)", () => {
  for (const { name, theme } of themes) {
    describe(name, () => {
      for (const [surfaceName, surface] of [
        ["background", theme.bg],
        ["raised surface", theme.surface],
      ] as const) {
        it(`keeps text readable on the ${surfaceName}`, () => {
          expect(contrast(theme.text, surface)).toBeGreaterThanOrEqual(7);
          expect(contrast(mix(theme.text, theme.bg, SOFT_TEXT_WEIGHT), surface)).toBeGreaterThanOrEqual(7);
          expect(contrast(theme.muted, surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrast(theme.accentText, surface)).toBeGreaterThanOrEqual(4.5);
        });
      }

      it("keeps map marker numbers readable on the accent colour", () => {
        expect(contrast(theme.accent, "#14110D")).toBeGreaterThanOrEqual(4.5);
      });

      it("keeps destination accents readable on the shared brand background (cards)", () => {
        expect(contrast(theme.accentText, BRAND_THEME.bg)).toBeGreaterThanOrEqual(4.5);
      });
    });
  }
});

describe("themeForPath", () => {
  const byslug = Object.fromEntries(getAllDestinations().map((d) => [d.slug, d.theme]));

  it("uses a destination's own theme on its guide", () => {
    expect(themeForPath("/destinations/kaindy-lake", byslug)).toBe(byslug["kaindy-lake"]);
  });

  it("uses the brand theme everywhere else, including unknown guides", () => {
    for (const path of ["/", "/destinations", "/map", "/about", "/saved", "/destinations/atlantis"]) {
      expect(themeForPath(path, byslug)).toBe(BRAND_THEME);
    }
  });
});
