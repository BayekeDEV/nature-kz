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
- **One template for every guide.** `src/app/destinations/[slug]/page.tsx` renders
  every destination. `generateStaticParams` lists the slugs; unknown slugs call
  `notFound()` and get a 404.
- **Themes are tokens.** Each destination has a seven-colour theme applied as CSS
  variables (see "Themes" below). Typography, spacing and layout are shared.

## Key files

| File | What it does |
| --- | --- |
| `src/lib/types.ts` | TypeScript types for destinations, media, sources. |
| `src/lib/filter.ts` | Pure search/filter logic + URL (`?q=&type=`) parsing. Unit-tested. |
| `src/lib/saved-store.ts` | Saved destinations behind a `SavedDestinationsStore` interface (localStorage today). Unit-tested. |
| `src/lib/use-saved-destinations.ts` | React hook using `useSyncExternalStore` (no hydration mismatch). |
| `src/lib/media.ts` | Checks if a photo file exists; missing photos render "Photo pending". |
| `src/components/destination/PhotoHero.tsx` | Shared full-screen hero: overscan drift, text scrim and fade into the theme background. |
| `src/lib/theme.ts` | Brand theme, theme → CSS variables, contrast maths. |
| `src/components/map/DestinationMap.tsx` | Interactive schematic map: every destination as its own marker, zoom/pan, details panel. |
| `src/lib/map-points.ts` | Projected map points and the pure view maths (zoom-to-separate, label room). Unit-tested. |
| `src/lib/image-sizes.ts` | Builds accurate `sizes` for photos cropped into cards, heroes and galleries. Unit-tested. |

## Themes

Every page uses the same components; only colours change.

- `src/lib/types.ts` → `DestinationTheme` has seven tokens: `bg` (also the colour
  the hero photo fades into), `surface`, `text`, `muted`, `accent`, `accentText`
  and `border`. Each destination stores its own values in `destinations.ts`;
  shared pages use `BRAND_THEME` in `src/lib/theme.ts`.
- `src/components/layout/RouteTheme.tsx` wraps the header, page and footer and
  sets the tokens as CSS variables (`--t-bg`, …) for the current URL. Because it
  lives in the layout, the background never flashes white between pages and
  changes colour smoothly.
- `globals.css` maps those variables to Tailwind colours with `@theme inline`
  (`bg-page`, `bg-raised`, `text-fg`, `text-fg-soft`, `text-fg-muted`,
  `border-line`, `text-accent-fg` …). `inline` is required so utilities read the
  variable where it is set, not a value frozen at `:root`.
- `src/lib/theme.test.ts` checks WCAG contrast for every theme (body text ≥ 7:1,
  secondary and accent text ≥ 4.5:1 on both surfaces).

## Page transitions

`src/app/template.tsx` wraps each page in a `div.page-enter`. A template
re-mounts on every route change, so a 260 ms CSS fade-and-lift plays once per
page. Links stay ordinary `<Link>`s (Ctrl/Cmd-click, new tabs and back/forward
work as normal), and changing catalogue filters does not replay the animation.
The animation uses `backwards` fill so no stacking context lingers afterwards;
the gallery lightbox is also portalled to `<body>` for the same reason.

## Map

`DestinationMap` draws the Natural Earth outline and every destination with one
equirectangular projection (`projectToMap` in `src/lib/map.ts`). Marker positions
come straight from published coordinates and are never nudged apart; tests check
that every point falls inside the outline and that the outline's extremes match
the projection of Kazakhstan's real extreme latitudes and longitudes.

The five south-eastern destinations are only a few kilometres apart at country
scale, so the map separates them by **zooming, not moving them**: selecting a
marker or a name in the list centres the map and zooms in just enough that the
nearest neighbour is at least 44 px away (`focusView`). Names show permanently
only where they have room (`roomyLabels`); otherwise on hover, focus or
selection. Zoom and reset buttons, drag-to-pan when zoomed and arrow keys move
the view; the mouse wheel is never captured, so the page scrolls normally. A
details panel below the map gives the name, region, what the point represents
and an "Explore destination" link. The same component is used on the homepage,
`/map` (with the list) and every guide (with that destination selected).

## Responsive images

Photos fill their frames with `object-fit: cover`. When a wide photo fills a tall
frame (a landscape in a 4:5 card, or any photo in a phone-height hero), it is
drawn wider than the frame, so `sizes` must say so or the browser downloads a
file that is too small. `coverSizes()` in `src/lib/image-sizes.ts` computes this
from each photo's real dimensions and the frame shape used by each component.

## Motion

- CSS keyframes for the hero text entrance (works without JavaScript).
- `Reveal` adds a fade-in for sections below the fold; content is visible by default.
- Motion (`motion/react`) for the hero's scroll-linked drift and menu/lightbox fades.
  The hero photo sits in an 8% taller layer and drifts at most 7%, so no zoom is
  needed and no edge is exposed. It stays still on touch and small screens.
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
