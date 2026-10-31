import type { Source } from "@/lib/types";

/**
 * Every source below was opened and read on the `accessedOn` date while this
 * content was written. Add new sources here, then reference them by id.
 */
const RESEARCH_DATE = "2026-10-27";
/** Research for Markakol Lake and the Aktolagay Plateau. */
const UPDATE_DATE = "2026-10-30";
/** Research for Katon-Karagay, Torysh, Lake Balkhash, Bayanaul & Jasybay and Aksu-Zhabagly. */
const EXPANSION_DATE = "2026-10-30";

function source(entry: Omit<Source, "accessedOn">, accessedOn = RESEARCH_DATE): Source {
  return { ...entry, accessedOn };
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
  ktMarkakolLake: source(
    {
      id: "kt-markakol-lake",
      title: "Lake Markakol",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://www.kazakhstan.travel/en/attractions/161",
      kind: "official-tourism",
    },
    UPDATE_DATE,
  ),
  ktMarkakolReserve: source(
    {
      id: "kt-markakol-reserve",
      title: "Markakol State Nature Reserve",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://www.kazakhstan.travel/en/attractions/159",
      kind: "official-tourism",
    },
    UPDATE_DATE,
  ),
  visitEastMarkakol: source(
    {
      id: "visit-east-markakol",
      title: "Markakol",
      publisher: "Visit East Qazaqstan (Tourist Information Centre of East Kazakhstan Region)",
      url: "https://visiteast.kz/en/populyarnyie-turobektyi/markakol/",
      kind: "official-tourism",
    },
    UPDATE_DATE,
  ),
  unescoMarkakol: source(
    {
      id: "unesco-markakol",
      title: "Markakol Biosphere Reserve",
      publisher: "UNESCO Man and the Biosphere Programme",
      url: "https://www.unesco.org/en/mab/markakol",
      kind: "international",
    },
    UPDATE_DATE,
  ),
  unescoNewReserves2022: source(
    {
      id: "unesco-new-reserves-2022",
      title: "UNESCO designates 11 new biosphere reserves (14 June 2022)",
      publisher: "UNESCO",
      url: "https://www.unesco.org/en/articles/unesco-designates-11-new-biosphere-reserves",
      kind: "international",
    },
    UPDATE_DATE,
  ),
  ktAktolagay: source(
    {
      id: "kt-aktolagay",
      title: "Aktolagay chalk mountain (in Kazakh)",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://kazakhstan.travel/kz/attractions/24",
      kind: "official-tourism",
    },
    UPDATE_DATE,
  ),
  visitAktobe: source(
    {
      id: "visit-aktobe",
      title: "Chalk mountains: the southern Aktolagay plateau (in Russian)",
      publisher: "Visit Aktobe (regional tourism portal)",
      url: "https://www.visitaktobe.kz/ru/guide/page/melovye-gory-yuzhnoe-plato-aktolagaj",
      kind: "official-tourism",
    },
    UPDATE_DATE,
  ),
  wikiRuAktolagay: source(
    {
      id: "wiki-ru-aktolagay",
      title: "Aktolagay (Russian-language article)",
      publisher: "Wikipedia",
      url: "https://ru.wikipedia.org/wiki/%D0%90%D0%BA%D1%82%D0%BE%D0%BB%D0%B0%D0%B3%D0%B0%D0%B9",
      kind: "reference",
    },
    UPDATE_DATE,
  ),
  ktKaton: source(
    {
      id: "kt-katon",
      title: "Katon-Karagay State National Nature Park",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://kazakhstan.travel/en/attractions/158",
      kind: "official-tourism",
    },
    EXPANSION_DATE,
  ),
  wikiKaton: source(
    {
      id: "wiki-katon",
      title: "Katon-Karagay National Park",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Katon-Karagay_National_Park",
      kind: "reference",
    },
    EXPANSION_DATE,
  ),
  ktTorysh: source(
    {
      id: "kt-torysh",
      title: "Valley of Balls: spherical concretions of the Torysh tract",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://kazakhstan.travel/en/attractions/325",
      kind: "official-tourism",
    },
    EXPANSION_DATE,
  ),
  wikiTorysh: source(
    {
      id: "wiki-torysh",
      title: "Torysh",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Torysh",
      kind: "reference",
    },
    EXPANSION_DATE,
  ),
  ktBalkhash: source(
    {
      id: "kt-balkhash",
      title: "Lake Balkhash",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://kazakhstan.travel/en/attractions/531",
      kind: "official-tourism",
    },
    EXPANSION_DATE,
  ),
  wikiBalkhash: source(
    {
      id: "wiki-balkhash",
      title: "Lake Balkhash",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Lake_Balkhash",
      kind: "reference",
    },
    EXPANSION_DATE,
  ),
  ktBayanaul: source(
    {
      id: "kt-bayanaul",
      title: "Bayanaul State National Nature Park",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://kazakhstan.travel/en/attractions/335",
      kind: "official-tourism",
    },
    EXPANSION_DATE,
  ),
  ktJasybay: source(
    {
      id: "kt-jasybay",
      title: "Lake Jasybay",
      publisher: "Kazakhstan.travel (official tourism portal)",
      url: "https://kazakhstan.travel/en/attractions/342",
      kind: "official-tourism",
    },
    EXPANSION_DATE,
  ),
  wikiBayanaul: source(
    {
      id: "wiki-bayanaul",
      title: "Bayanaul National Park",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Bayanaul_National_Park",
      kind: "reference",
    },
    EXPANSION_DATE,
  ),
  osmJasybay: source(
    {
      id: "osm-jasybay",
      title: "Lake Jasybay (mapped lake outline)",
      publisher: "OpenStreetMap",
      url: "https://www.openstreetmap.org/relation/5992637",
      kind: "reference",
    },
    EXPANSION_DATE,
  ),
  kazinformAksu: source(
    {
      id: "kazinform-aksu",
      title: "Aksu-Zhabagly reserve: how to get there and what to see (31 May 2023, in Russian)",
      publisher: "Kazinform (national news agency)",
      url: "https://www.inform.kz/ru/aksu-zhabaglinskiy-zapovednik-kak-doehat-i-chto-posmotret_a4073315",
      kind: "news",
    },
    EXPANSION_DATE,
  ),
  unescoWesternTienShan: source(
    {
      id: "unesco-western-tien-shan",
      title: "Western Tien-Shan (World Heritage property, inscribed 2016)",
      publisher: "UNESCO World Heritage Centre",
      url: "https://whc.unesco.org/en/list/1490/",
      kind: "international",
    },
    EXPANSION_DATE,
  ),
  wikiAksu: source(
    {
      id: "wiki-aksu",
      title: "Aksu-Zhabagly Nature Reserve",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Aksu-Zhabagly_Nature_Reserve",
      kind: "reference",
    },
    EXPANSION_DATE,
  ),
} satisfies Record<string, Source>;
