import { describe, expect, it } from "vitest";
import { CARD_FRAMES, coverScale, coverSizes, HERO_FRAMES } from "@/lib/image-sizes";

describe("coverScale", () => {
  it("is 1 when the photo is limited by the box width", () => {
    expect(coverScale({ width: 3000, height: 2000 }, 0.5)).toBe(1);
  });

  it("grows when a wide photo fills a tall box", () => {
    // A 3:2 photo in a 4:5 card is drawn 1.875× wider than the card.
    expect(coverScale({ width: 3000, height: 2000 }, 1.25)).toBeCloseTo(1.875);
  });
});

describe("coverSizes", () => {
  it("asks for a wider file for panoramas in portrait cards", () => {
    const panorama = coverSizes({ width: 5600, height: 1904 }, CARD_FRAMES);
    // The old card sizes asked for only 30vw on desktop, so a 2.94:1 panorama was upscaled ~2.3×.
    expect(panorama.startsWith("(min-width: 1024px) 111vw")).toBe(true);
  });

  it("keeps plain widths for photos that fit their box", () => {
    expect(coverSizes({ width: 1000, height: 1000 }, [{ vw: 50, frame: 0.5 }])).toBe("50vw");
  });

  it("supports pixel widths and media conditions", () => {
    expect(coverSizes({ width: 4000, height: 3000 }, [{ media: "(min-width: 640px)", px: 160, frame: 0.75 }, { px: 104, frame: 0.75 }])).toBe(
      "(min-width: 640px) 160px, 104px",
    );
  });

  it("requests a tall-enough hero on portrait phones", () => {
    const sizes = coverSizes({ width: 4000, height: 3000 }, HERO_FRAMES);
    expect(sizes).toMatch(/^\(max-width: 767px\) and \(orientation: portrait\) 294vw/);
  });
});
