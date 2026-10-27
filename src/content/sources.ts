import type { Source } from "@/lib/types";

/**
 * Every source below was opened and read on the `accessedOn` date while this
 * content was written. Add new sources here, then reference them by id.
 */
const RESEARCH_DATE = "2026-10-27";

function source(entry: Omit<Source, "accessedOn">): Source {
  return { ...entry, accessedOn: RESEARCH_DATE };
}

export const sources = {
  ktBozzhyra: source({
    id: "kt-bozzhyra",
    title: "Bozzhyra Tract",
    publisher: "Kazakhstan.travel (official tourism portal)",
    url: "https://kazakhstan.travel/en/attractions/326",
    kind: "official-tourism",
  }),
  kursivBozzhyra: source({
    id: "kursiv-bozzhyra",
    title: "Bozzhyra tract won't be part of Ustyurt Nature Reserve (10 January 2025)",
    publisher: "Kursiv Media",
    url: "https://kz.kursiv.media/en/2025-01-10/engk-tank-bozzhyra-tract-wont-be-part-of-ustyurt-nature-reserve/",
    kind: "news",
  }),
  astanaTimesBozzhyra: source({
    id: "astana-times-bozzhyra",
    title: "Bozzhyra tract “sugar castles” fascinate tourists (July 2019)",
    publisher: "The Astana Times",
    url: "https://astanatimes.com/2019/07/bozzhyra-tract-sugar-castles-fascinate-tourists/",
    kind: "news",
  }),
  kolsaiPark: source({
    id: "kolsai-park",
    title: "Kolsai Lakes State National Nature Park — official website",
    publisher: "Kolsai Koldery State National Nature Park",
    url: "https://kolsai-koldery.kz/",
    kind: "official-park",
  }),
  wikiKolsai: source({
    id: "wiki-kolsai",
    title: "Kolsay Lakes National Park",
    publisher: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Kolsay_Lakes_National_Park",
    kind: "reference",
  }),
  wikiRuKolsai: source({
    id: "wiki-ru-kolsai",
    title: "Kolsai Lakes (Russian-language article, coordinates)",
    publisher: "Wikipedia",
    url: "https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D0%BB%D1%8C%D1%81%D0%B0%D0%B9%D1%81%D0%BA%D0%B8%D0%B5_%D0%BE%D0%B7%D1%91%D1%80%D0%B0",
    kind: "reference",
  }),
  ktKaindy: source({
    id: "kt-kaindy",
    title: "Lake Kaindy",
    publisher: "Kazakhstan.travel (official tourism portal)",
    url: "https://kazakhstan.travel/en/attractions/68",
    kind: "official-tourism",
  }),
  wikiKaindy: source({
    id: "wiki-kaindy",
    title: "Lake Kaindy",
    publisher: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Lake_Kaindy",
    kind: "reference",
  }),
  wikiCharynPark: source({
    id: "wiki-charyn-park",
    title: "Charyn National Park",
    publisher: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Charyn_National_Park",
    kind: "reference",
  }),
  wikiCharynCanyon: source({
    id: "wiki-charyn-canyon",
    title: "Charyn Canyon",
    publisher: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Charyn_Canyon",
    kind: "reference",
  }),
  qgCharyn: source({
    id: "qg-charyn",
    title: "Sharyn National Park",
    publisher: "QazaqGeography",
    url: "https://qazaqgeography.kz/en/sharyn-ulttyk-parki-14104030",
    kind: "reference",
  }),
  altynEmelDune: source({
    id: "altyn-emel-dune",
    title: "Aigaikum (the Singing Dune)",
    publisher: "Altyn-Emel State National Nature Park (official website, in Kazakh)",
    url: "https://altynemel-park.kz/%d0%b0%d0%b9%d2%93%d0%b0%d0%b9%d2%9b%d2%b1%d0%bc/",
    kind: "official-park",
  }),
  ktAltynEmel: source({
    id: "kt-altyn-emel",
    title: "Altyn-Emel State National Nature Park",
    publisher: "Kazakhstan.travel (official tourism portal)",
    url: "https://kazakhstan.travel/en/attractions/200",
    kind: "official-tourism",
  }),
  wikiRuSingingDune: source({
    id: "wiki-ru-singing-dune",
    title: "Singing Dune (Russian-language article, coordinates)",
    publisher: "Wikipedia",
    url: "https://ru.wikipedia.org/wiki/%D0%9F%D0%BE%D1%8E%D1%89%D0%B8%D0%B9_%D0%B1%D0%B0%D1%80%D1%85%D0%B0%D0%BD",
    kind: "reference",
  }),
  burabayZhumbaktas: source({
    id: "burabay-zhumbaktas",
    title: "Zhumbaktas Rock",
    publisher: "Burabay State National Nature Park (official website, in Kazakh)",
    url: "https://burabaypark.qr-pib.kz/p/23234",
    kind: "official-park",
  }),
  burabayOkzhetpes: source({
    id: "burabay-okzhetpes",
    title: "Okzhetpes Rock",
    publisher: "Burabay State National Nature Park (official website, in Kazakh)",
    url: "https://burabaypark.qr-pib.kz/p/23232",
    kind: "official-park",
  }),
  burabayRules: source({
    id: "burabay-rules",
    title: "Rules for visiting the park",
    publisher: "Burabay State National Nature Park (official website, in Kazakh)",
    url: "https://burabaypark.qr-pib.kz/p/2527",
    kind: "official-park",
  }),
  burabayAbout: source({
    id: "burabay-about",
    title: "About the park",
    publisher: "Burabay State National Nature Park (official website, in Kazakh)",
    url: "https://burabaypark.qr-pib.kz/",
    kind: "official-park",
  }),
  wikiBurabay: source({
    id: "wiki-burabay",
    title: "Burabay National Park",
    publisher: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Burabay_National_Park",
    kind: "reference",
  }),
  ileAlatau: source({
    id: "ile-alatau",
    title: "Ile-Alatau State National Nature Park — official website",
    publisher: "Ile-Alatau State National Nature Park",
    url: "https://www.ile-alatau.kz/",
    kind: "official-park",
  }),
  ileAlatauRules: source({
    id: "ile-alatau-rules",
    title: "Rules for staying in the protected area (amended 18 April 2023)",
    publisher: "Ile-Alatau State National Nature Park (official website, in Kazakh)",
    url: "https://www.ile-alatau.kz/eqta-da-bolw-erezhesi/",
    kind: "official-park",
  }),
  wikiBigAlmaty: source({
    id: "wiki-big-almaty",
    title: "Big Almaty Lake",
    publisher: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Big_Almaty_Lake",
    kind: "reference",
  }),
} satisfies Record<string, Source>;
