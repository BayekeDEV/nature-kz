# NATURE KZ

*Discover Kazakhstan, beyond the familiar.*

An English-language editorial guide to fourteen natural destinations in Kazakhstan:
Bozzhyra, the Aktolagay Plateau and Torysh — Valley of Balls in the west; Kolsai
Lakes, Charyn Canyon, Kaindy Lake, the Singing Dune, Big Almaty Lake and
Aksu-Zhabagly in the south and south-east; Lake Balkhash in the central steppe;
Burabay — Zhumbaktas and Bayanaul & Jasybay Lake in the north; and Markakol Lake
and Katon-Karagay in the Altai.

It is an independent student project: not an official tourism service, with no
bookings, accounts, payments or API keys.

## Features

- **Destination guides**: one static page per destination with sourced text,
  quick facts, a gallery with a lightbox, geographic context, related
  destinations and dated sources. Each guide has its own colour theme.
- **Photo-first heroes**: on phones only the photo and the destination name
  open the page; the introduction, Save button and quick facts follow below.
- **Catalogue**: search by name, region or landscape and filter by type
  (lakes, canyons and rock formations, dunes, mountains and forests). The state
  lives in the URL (`?q=…&type=…`).
- **Interactive atlas** (`/map`): MapLibre GL JS over self-hosted Natural Earth
  relief, with every destination as a linked marker, hover/focus previews and
  "Locate on map". Other pages use a light static version of the same map.
- **Saved destinations**: stored in this browser only (`localStorage`); no account.
- **Photo credits**: every photo's author, licence and source on `/photo-credits`.
- Accessible by design: keyboard navigation, visible focus, reduced-motion
  support and contrast-tested themes.

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
| `npm run test` | Unit tests (Vitest): data integrity, filters, map positions, themes, saved state |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint |
| `npm run check` | typecheck + lint + test |

No environment variables are needed.

## Architecture

- **Next.js 16** (App Router, Cache Components) · React 19 · TypeScript (strict) ·
  Tailwind CSS 4 · Motion 12 · Lucide icons · MapLibre GL JS 6 · Vitest 4.
  Fonts: Cormorant Garamond and DM Sans via `next/font`.
- **Content** is a typed dataset in `src/content/` (destinations, sources) read
  through a small data-access layer in `src/lib/destinations.ts`, ready to move
  to a database later. There is no database, API or server-side state.
- **All pages are prerendered at build time.** The only external request at run
  time is optional terrain hillshade on the atlas (see below).
- **Map data** is self-hosted in `public/atlas/`, built once by
  `scripts/build-atlas.mjs`; provider settings live in `src/content/atlas.ts`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage: featured hero, a curated selection, static atlas preview |
| `/destinations` | Catalogue with search and filters |
| `/destinations/[slug]` | Destination guide (unknown slugs → 404) |
| `/map` | Interactive relief atlas, destination list and reference points |
| `/saved` | Saved destinations (this browser only) |
| `/about` | Purpose and editorial methodology |
| `/photo-credits` | Author, licence and source of every photo, by destination |

## Deployment

The site deploys to Vercel as a standard Next.js project (framework preset
"Next.js", default build command `next build`, no environment variables).
Nothing else is required: no database, API service or map key.

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how it fits together, future PostgreSQL model
- [docs/PHOTO-GUIDE.md](docs/PHOTO-GUIDE.md): adding or replacing photos
- [docs/ASSET-MANIFEST.md](docs/ASSET-MANIFEST.md): every photo, its author and licence
  (regenerate with `node scripts/build-asset-manifest.mjs`)
- [docs/CONTENT-CHECKLIST.md](docs/CONTENT-CHECKLIST.md): what to re-verify before publishing

## Credits and licences

- **Photographs**: Wikimedia Commons contributors (some files first published on
  Flickr or Panoramio), each under its own licence (CC BY, CC BY-SA, CC0 or public
  domain) as listed in the asset manifest and on `/photo-credits`. They are not
  covered by any licence of this repository's code.
- **Map**: relief, land cover and vectors from [Natural Earth](https://www.naturalearthdata.com/)
  (public domain). Finer relief when zoomed in from
  [Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen, AWS Open
  Data): SRTM and GMTED2010 courtesy of the U.S. Geological Survey, ETOPO1
  courtesy of NOAA. Map labels use Open Sans glyphs (Open Font License / Apache 2.0).
- **Facts**: each guide lists its sources with the date they were read. Access,
  fees and permits change; always check official park information before travelling.
