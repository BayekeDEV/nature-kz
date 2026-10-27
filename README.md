# NATURE KZ

*Discover Kazakhstan, beyond the familiar.*

An English-language editorial guide to seven natural destinations in Kazakhstan:
Bozzhyra, Kolsai Lakes, Charyn Canyon, Kaindy Lake, the Singing Dune,
Burabay — Zhumbaktas and Big Almaty Lake. Sourced guides, licensed photography,
a schematic map and a browser-only "saved" list. No bookings, accounts or API keys.

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
Tailwind CSS 4 · Motion 12 · Lucide icons · Vitest 4.
Fonts: Cormorant Garamond (headings) and DM Sans (text) via `next/font`.

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage with Bozzhyra hero, collection, map preview |
| `/destinations` | Catalogue with search and filters (`?q=…&type=lakes`) |
| `/destinations/[slug]` | Destination guide (7 static pages; unknown slugs → 404) |
| `/saved` | Saved destinations (stored in this browser only) |
| `/map` | Schematic map and reference points |
| `/about` | Purpose, methodology, photo credits |

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it fits together, future PostgreSQL model
- [docs/PHOTO-GUIDE.md](docs/PHOTO-GUIDE.md) — adding or replacing photos
- [docs/ASSET-MANIFEST.md](docs/ASSET-MANIFEST.md) — every photo, its author and licence
- [docs/CONTENT-CHECKLIST.md](docs/CONTENT-CHECKLIST.md) — what to re-verify before publishing

Photographs: Wikimedia Commons contributors, under the licences listed in the
asset manifest. Map outline: Natural Earth (public domain).
