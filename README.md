# NATURE KZ

*Discover Kazakhstan, beyond the familiar.*

An English-language editorial guide to fourteen natural destinations in Kazakhstan:
Bozzhyra, the Aktolagay Plateau and Torysh — Valley of Balls in the west; Kolsai
Lakes, Charyn Canyon, Kaindy Lake, the Singing Dune, Big Almaty Lake and
Aksu-Zhabagly in the south and south-east; Lake Balkhash in the central steppe;
Burabay — Zhumbaktas and Bayanaul & Jasybay Lake in the north; and Markakol Lake
and Katon-Karagay in the Altai. Sourced guides,
licensed photography, an interactive relief atlas and a browser-only "saved"
list. No bookings, accounts or API keys.

## Run it

Requires Node.js 20.9+ (developed with Node 24) and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (prerenders all pages) |
| `npm run start` | Serve the production build on port 3000 |
| `npm run test` | Unit tests (Vitest): filters, unknown slugs, saved state, content integrity |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint |
| `npm run check` | typecheck + lint + test |

No environment variables are needed.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) ·
Tailwind CSS 4 · Motion 12 · Lucide icons · MapLibre GL JS 6 (atlas) · Vitest 4.
Fonts: Cormorant Garamond (headings) and DM Sans (text) via `next/font`.

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage with Bozzhyra hero, collection, static atlas preview |
| `/destinations` | Catalogue with search and filters (`?q=…&type=lakes`) |
| `/destinations/[slug]` | Destination guide (one static page per destination; unknown slugs → 404) |
| `/saved` | Saved destinations (stored in this browser only) |
| `/map` | Interactive relief atlas (every destination marked), destination list and reference points |
| `/about` | Purpose and editorial methodology |
| `/photo-credits` | Author, licence and source of every photo, grouped by destination |

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it fits together, future PostgreSQL model
- [docs/PHOTO-GUIDE.md](docs/PHOTO-GUIDE.md) — adding or replacing photos
- [docs/ASSET-MANIFEST.md](docs/ASSET-MANIFEST.md) — every photo, its author and licence
- [docs/CONTENT-CHECKLIST.md](docs/CONTENT-CHECKLIST.md) — what to re-verify before publishing

Photographs: Wikimedia Commons contributors (some files originally from Flickr
or Panoramio), under the licences listed in the asset manifest and on
`/photo-credits`. Regenerate the manifest with `node scripts/build-asset-manifest.mjs`. Map relief, land cover and vectors: Natural Earth (public domain);
finer relief when zoomed in: Terrain Tiles on AWS Open Data (see docs/ARCHITECTURE.md).
