import { describe, expect, it } from "vitest";
import { filterDestinations, parseCatalogueParams, toCatalogueSearch } from "@/lib/filter";
import { getDestinationSummaries } from "@/lib/destinations";

const all = getDestinationSummaries();
const names = (items: { name: string }[]) => items.map((d) => d.name).sort();

describe("filterDestinations", () => {
  it("returns everything with no query and the 'all' category", () => {
    expect(filterDestinations(all, { q: "", category: "all" })).toHaveLength(7);
  });

  it("filters by landscape category", () => {
    expect(names(filterDestinations(all, { q: "", category: "lakes" }))).toEqual(["Big Almaty Lake", "Kaindy Lake", "Kolsai Lakes"]);
    expect(names(filterDestinations(all, { q: "", category: "dunes" }))).toEqual(["Singing Dune"]);
    expect(names(filterDestinations(all, { q: "", category: "canyons-rocks" }))).toEqual([
      "Bozzhyra",
      "Burabay — Zhumbaktas",
      "Charyn Canyon",
    ]);
  });

  it("matches names and descriptive text, case-insensitively", () => {
    expect(names(filterDestinations(all, { q: "KAINDY", category: "all" }))).toEqual(["Kaindy Lake"]);
    expect(names(filterDestinations(all, { q: "chalk", category: "all" }))).toEqual(["Bozzhyra"]);
    expect(names(filterDestinations(all, { q: "valley of castles", category: "all" }))).toEqual(["Charyn Canyon"]);
  });

  it("requires every word to match and combines with the category", () => {
    expect(names(filterDestinations(all, { q: "almaty lake", category: "all" }))).toContain("Big Almaty Lake");
    expect(filterDestinations(all, { q: "chalk", category: "lakes" })).toEqual([]);
  });

  it("treats hyphens and dashes like spaces", () => {
    expect(names(filterDestinations(all, { q: "altyn emel", category: "all" }))).toEqual(["Singing Dune"]);
    expect(names(filterDestinations(all, { q: "burabay-zhumbaktas", category: "all" }))).toEqual(["Burabay — Zhumbaktas"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterDestinations(all, { q: "volcano", category: "all" })).toEqual([]);
  });
});

describe("catalogue URL state", () => {
  it("falls back to safe defaults for unknown or missing values", () => {
    expect(parseCatalogueParams(new URLSearchParams("type=volcanoes"))).toEqual({ q: "", category: "all" });
    expect(parseCatalogueParams(new URLSearchParams(""))).toEqual({ q: "", category: "all" });
  });

  it("round-trips a filtered view and omits defaults", () => {
    const search = toCatalogueSearch({ q: "  lake ", category: "lakes" });
    expect(search).toBe("?q=lake&type=lakes");
    expect(parseCatalogueParams(new URLSearchParams(search))).toEqual({ q: "lake", category: "lakes" });
    expect(toCatalogueSearch({ q: "", category: "all" })).toBe("");
  });

  it("limits very long queries", () => {
    expect(parseCatalogueParams(new URLSearchParams(`q=${"a".repeat(500)}`)).q).toHaveLength(80);
  });
});
