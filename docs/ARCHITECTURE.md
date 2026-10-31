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
| `src/components/destination/PhotoHero.tsx` | Shared full-screen hero: title-only on phones (per-destination `mobileTitlePlacement`), full editorial composition on wide screens, overscan drift, local scrims and fade into the theme background. |
| `src/app/photo-credits/page.tsx` | Photo credits grouped by destination, generated from the dataset (linked from the footer). |
| `scripts/build-asset-manifest.mjs` | Regenerates `docs/ASSET-MANIFEST.md` from the dataset. |
| `src/lib/theme.ts` | Brand theme, theme → CSS variables, contrast maths. |
| `src/content/atlas.ts` | Map provider configuration: atlas extent, files, terrain tiles, credits. The one place to change map sources. |
| `src/components/map/AtlasMap.tsx` | Interactive atlas (MapLibre, loaded on demand) with linked markers, previews and a "Locate on map" list. |
| `src/components/map/atlas-style.ts` | The MapLibre style: layers, colours and labels. |
| `src/components/map/StaticAtlas.tsx` | Light, WebGL-free atlas for the homepage, guides and as the fallback. |
| `src/lib/atlas.ts` | Pure projection and zoom maths shared by both maps. Unit-tested. |
| `scripts/build-atlas.mjs` | Rebuilds `public/atlas/` from Natural Earth (run once; outputs are committed). |
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

## Photographic heroes on phones and wide screens

`PhotoHero` has two compositions, switched by the `hero-wide` custom variant in
`globals.css`: at least 768 px wide **and** 600 px tall. The height condition
means phones in landscape also get the phone layout.

- **Phones:** the photo fills about one screen (`100svh`, with a `100vh`
  fallback and a 22 rem minimum) and only the destination name sits on it, at
  `mobileTitlePlacement` (`top`, `center` or `bottom`) from the dataset, chosen
  per photo so the title uses open sky or ground. A local scrim sits only
  behind the title. The title is 32–44 px with balanced line breaks. The
  category, region, introduction, Save button and photo credit follow the hero
  in normal flow, then the quick facts.
- **Wide screens:** the full composition: eyebrow, large title, intro and
  actions over the photo, with quick facts overlapping the hero's fade.

Both arrangements are rendered on the server and switched with CSS only, so
there is no wrong crop or layout while the page hydrates. The copy that is not
shown is `display: none`, which removes it from the accessibility tree, so
screen readers never hear it twice. The crop comes from each photo's
`focal.mobile` / `focal.desktop` in the dataset.

## Page transitions

`src/app/template.tsx` wraps each page in a `div.page-enter`. A template
re-mounts on every route change, so a 260 ms CSS fade-and-lift plays once per
page. Links stay ordinary `<Link>`s (Ctrl/Cmd-click, new tabs and back/forward
work as normal), and changing catalogue filters does not replay the animation.
The animation uses `backwards` fill so no stacking context lingers afterwards;
the gallery lightbox is also portalled to `<body>` for the same reason.

## Map (atlas)

**Library:** MapLibre GL JS 6 (BSD-3, open source), the only map framework. It is
imported dynamically on `/map` only, so other pages ship no WebGL code.

**Data, all self-hosted in `public/atlas/` (no account, no key):**

- `relief-mercator.webp` — the Natural Earth I raster (land cover with shaded
  relief, water and drainage, public domain), cropped to 36–97° E, 34–60° N,
  reprojected to Web Mercator and colour-graded for the dark site by
  `scripts/build-atlas.mjs`. It is real land cover and relief, not satellite
  imagery.
- `atlas-layers.geojson` — Natural Earth vectors: Kazakhstan's boundary,
  neighbouring borders, lakes and seas, rivers, and a few English labels.
- `fonts/` — Open Sans glyphs (Open Font License / Apache 2.0) from the
  openmaptiles/fonts project, needed for map labels.

**Optional finer relief:** from zoom 5 a hillshade layer is drawn from the
[Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) dataset on the AWS
Registry of Open Data (Terrarium PNG tiles; keyless, CORS-enabled, requested
only over the atlas area). Attribution is shown under the map. If those tiles
fail, the error is ignored and the self-hosted map stays complete. The map is
2D and north-up: no 3D terrain, no rotation or pitch.

**Markers and labels:** each destination is an HTML marker at its published
coordinate, rendered as a real link to its guide; markers are never moved.
Hover or keyboard focus shows a preview card (photo, name, region) that stays
open while the pointer is on it. Names are a MapLibre symbol layer with
collision detection, so crowded south-eastern names hide until you zoom in; an
invisible marker-sized symbol keeps every label clear of the markers.

**Interaction:** zoom in/out, reset and full screen buttons; MapLibre's
keyboard controls on the focused map; cooperative gestures (Ctrl/⌘ + scroll,
two-finger drag on touch) so the page always scrolls normally. The list under
the map links to each guide and has "Locate on map", which flies to the
destination (a jump with reduced motion), zooms until its nearest neighbour is
about 110 px away, highlights the marker, focuses it and sets `/map#slug`.
Guides link to `/map#slug`. The view is fitted once on load and never reset
unless you press reset.

**Fallback:** without WebGL2, if MapLibre fails to load, or if the map has not
loaded after 25 seconds of visible rendering, `/map` shows `StaticAtlas` with
the same linked markers and keeps the list. The homepage and guide pages always
use `StaticAtlas`: the same relief image and Mercator maths (`src/lib/atlas.ts`)
cropped to Kazakhstan, with no WebGL.

**Rebuilding the data:** download `NE1_HR_LC_SR_W_DR.zip` from Natural Earth,
unzip it and run `node scripts/build-atlas.mjs path/to/NE1_HR_LC_SR_W_DR.tif`.
Keep `ATLAS_BOUNDS` in `src/content/atlas.ts` in step with the script. Tests in
`src/lib/atlas.test.ts` check the projection and that every destination lies
inside Kazakhstan's boundary.

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
