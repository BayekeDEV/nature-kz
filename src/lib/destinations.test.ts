import { describe, expect, it } from "vitest";
import {
  getAllDestinations,
  getDestinationBySlug,
  getDestinationSlugs,
  getMedia,
  getRelatedDestinations,
} from "@/lib/destinations";

const REQUIRED_SLUGS = [
  "bozzhyra",
  "kolsai-lakes",
  "charyn-canyon",
  "kaindy-lake",
  "singing-dune",
  "burabay-zhumbaktas",
  "big-almaty-lake",
  "markakol-lake",
  "aktolagay-plateau",
  "katon-karagay",
  "torysh-valley-of-balls",
  "lake-balkhash",
  "bayanaul-jasybay",
  "aksu-zhabagly",
];

/** IDs saved in browsers before the collection grew; they must never change. */
const ORIGINAL_IDS = [
  "dst-bozzhyra",
  "dst-kolsai-lakes",
  "dst-charyn-canyon",
  "dst-kaindy-lake",
  "dst-singing-dune",
  "dst-burabay-zhumbaktas",
  "dst-big-almaty-lake",
];

describe("destination data access", () => {
  it("contains exactly the agreed slugs, in order", () => {
    expect(getDestinationSlugs()).toEqual(REQUIRED_SLUGS);
  });

  it("uses unique ids and slugs", () => {
    const all = getAllDestinations();
    expect(new Set(all.map((d) => d.id)).size).toBe(all.length);
    expect(new Set(all.map((d) => d.slug)).size).toBe(all.length);
    for (const d of all) expect(d.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("keeps the ids of the original destinations so existing saves still resolve", () => {
    const ids = getAllDestinations().map((d) => d.id);
    for (const id of ORIGINAL_IDS) expect(ids).toContain(id);
  });

  it("keeps Torysh in Mangystau Region, not West Kazakhstan Region", () => {
    const torysh = getDestinationBySlug("torysh-valley-of-balls")!;
    expect(torysh.region).toContain("Mangystau Region");
    expect(torysh.region).not.toContain("West Kazakhstan Region");
  });

  it("does not place Bayanaul in southern Kazakhstan", () => {
    expect(getDestinationBySlug("bayanaul-jasybay")!.region).not.toMatch(/south/i);
  });

  it("labels Aktolagay as Aktobe Region, not West Kazakhstan Region", () => {
    const aktolagay = getDestinationBySlug("aktolagay-plateau");
    expect(aktolagay?.region).toMatch(/^Aktobe Region/);
    expect(JSON.stringify(aktolagay)).not.toMatch(/West Kazakhstan Region/);
  });

  it("returns undefined for unknown slugs (rendered as a 404 page)", () => {
    expect(getDestinationBySlug("atlantis")).toBeUndefined();
    expect(getDestinationBySlug("")).toBeUndefined();
    expect(getDestinationBySlug("BOZZHYRA")).toBeUndefined();
  });

  it("finds a known destination", () => {
    expect(getDestinationBySlug("kaindy-lake")?.name).toBe("Kaindy Lake");
  });

  it("only links related destinations that exist", () => {
    for (const d of getAllDestinations()) {
      const related = getRelatedDestinations(d);
      expect(related.length).toBeGreaterThanOrEqual(2);
      expect(related.map((r) => r.slug)).not.toContain(d.slug);
    }
  });
});

describe("content integrity", () => {
  for (const d of getAllDestinations()) {
    describe(d.name, () => {
      const sourceIds = new Set(d.sources.map((s) => s.id));

      it("cites only sources listed on the page", () => {
        for (const section of [d.special, d.history, d.planning]) {
          expect(section.sourceIds.length).toBeGreaterThan(0);
          for (const id of section.sourceIds) expect(sourceIds).toContain(id);
        }
        if (d.coordinates) expect(sourceIds).toContain(d.coordinates.sourceId);
      });

      it("has guide text within the planned length", () => {
        const words = [d.special, d.history, d.planning]
          .flatMap((s) => s.paragraphs)
          .join(" ")
          .split(/\s+/).length;
        expect(words).toBeGreaterThanOrEqual(300);
        expect(words).toBeLessThanOrEqual(600);
      });

      it("has a real verification date only when marked verified", () => {
        if (d.status === "verified") expect(d.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        else expect(d.verifiedOn).toBeNull();
      });

      it("uses the agreed media file convention and the hero file exists", () => {
        for (const m of d.media) expect(m.src).toBe(`/images/destinations/${d.slug}/${m.role}.jpg`);
        expect(getMedia(d, "hero").available).toBe(true);
      });

      it("uses distinct photographs in the gallery", () => {
        const sources = d.media.map((m) => m.credit.sourceUrl);
        expect(new Set(sources).size).toBe(sources.length);
      });
    });
  }
});
