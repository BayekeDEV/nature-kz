# Architecture

A short tour for future you.

## How a page is built

```
src/content/          ← the data: destinations, sources, map outline
      │
src/lib/destinations.ts  ← data-access layer: getDestinationBySlug(), getDestinationSummaries() …
      │
src/app/**/page.tsx   ← Server Components: fetch data, render HTML at build time
      │
src/components/**     ← UI pieces. Only interactive ones are Client Components ("use client")
```

- **Content is separate from presentation.** Every fact lives in
  `src/content/destinations.ts`. Components receive data as props and never
  contain destination facts.
- **Server first.** Pages are Server Components and are prerendered at build time
  (`npm run build` shows them as static). Client components are only used where the
  browser is needed: header/menu, save buttons, catalogue filters, gallery lightbox,
  saved list, and scroll motion.
- **Small client payload.** Client components get a `DestinationSummary` (name,
  region, category, short text, hero image) — not the full guide text and sources.
- **One template for seven guides.** `src/app/destinations/[slug]/page.tsx` renders
  every destination. `generateStaticParams` lists the slugs; unknown slugs call
  `notFound()` and get a 404.
- **Themes are tokens.** Each destination has three colours (`accent`, `deep`,
  `wash`) applied as CSS variables. Typography, spacing and layout are shared.

## Key files

| File | What it does |
| --- | --- |
| `src/lib/types.ts` | TypeScript types for destinations, media, sources. |
| `src/lib/filter.ts` | Pure search/filter logic + URL (`?q=&type=`) parsing. Unit-tested. |
| `src/lib/saved-store.ts` | Saved destinations behind a `SavedDestinationsStore` interface (localStorage today). Unit-tested. |
| `src/lib/use-saved-destinations.ts` | React hook using `useSyncExternalStore` (no hydration mismatch). |
| `src/lib/media.ts` | Checks if a photo file exists; missing photos render "Photo pending". |
| `src/components/destination/PhotoHero.tsx` | Shared full-screen hero with subtle 2D scroll motion. |
| `src/components/map/KazakhstanMap.tsx` | Schematic SVG map with HTML markers at published reference points. |

## Motion

- CSS keyframes for the hero text entrance (works without JavaScript).
- `Reveal` adds a fade-in for sections below the fold; content is visible by default.
- Motion (`motion/react`) for the hero's scroll-linked drift and menu/lightbox fades.
- `prefers-reduced-motion` turns all of this off.

## Future database (PostgreSQL)

The TypeScript types were designed to map onto tables like these:

```sql
CREATE TABLE destinations (
  id            TEXT PRIMARY KEY,           -- 'dst-bozzhyra'
  slug          TEXT UNIQUE NOT NULL,       -- 'bozzhyra'
  name          TEXT NOT NULL,
  region        TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('lakes','canyons-rocks','dunes')),
  summary       TEXT NOT NULL,
  intro         TEXT NOT NULL,
  body          JSONB NOT NULL,             -- sections: special, history, planning
  latitude      NUMERIC(8,5),
  longitude     NUMERIC(8,5),
  theme         JSONB NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft',
  verified_on   DATE
);

CREATE TABLE destination_images (
  id             SERIAL PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  role           TEXT NOT NULL,             -- 'hero', 'gallery-01' …
  file_path      TEXT NOT NULL,
  alt            TEXT NOT NULL,
  caption        TEXT,
  author         TEXT NOT NULL,
  license        TEXT NOT NULL,
  source_url     TEXT NOT NULL,
  UNIQUE (destination_id, role)
);

CREATE TABLE sources (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  publisher   TEXT NOT NULL,
  url         TEXT NOT NULL,
  kind        TEXT NOT NULL,
  accessed_on DATE NOT NULL
);

-- Many-to-many: one source can support several destinations.
CREATE TABLE destination_sources (
  destination_id TEXT REFERENCES destinations(id) ON DELETE CASCADE,
  source_id      TEXT REFERENCES sources(id),
  PRIMARY KEY (destination_id, source_id)
);

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE saved_destinations (
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  destination_id TEXT REFERENCES destinations(id) ON DELETE CASCADE,
  saved_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, destination_id)     -- a user saves a place once
);
```

Relationships in plain words:

- A **destination** has many **images** (one per role).
- **Destinations** and **sources** are many-to-many through `destination_sources`.
- A **user** has many **saved destinations**; `saved_destinations` is the join table
  between users and destinations.

Migration path: replace the bodies of the functions in `src/lib/destinations.ts`
with SQL queries, and write a second `SavedDestinationsStore` implementation that
calls an API route instead of localStorage. Components stay the same.
