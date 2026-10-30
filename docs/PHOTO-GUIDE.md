# Photo guide

The site already ships with 28 licensed photographs from Wikimedia Commons (see
[ASSET-MANIFEST.md](ASSET-MANIFEST.md)). Use this guide when you want to replace
one with your own photo or a better free image.

## 1. Where each photo goes

Every destination has one folder and four files. Filenames are fixed — the code
finds photos by these exact names, so you do not need to edit any component.

```
public/images/destinations/<slug>/hero.jpg        ← full-screen top photo
public/images/destinations/<slug>/gallery-01.jpg  ← gallery photo 1
public/images/destinations/<slug>/gallery-02.jpg  ← gallery photo 2
public/images/destinations/<slug>/gallery-03.jpg  ← gallery photo 3
```

| Destination | `<slug>` folder | What the hero should show |
| --- | --- | --- |
| Bozzhyra | `bozzhyra` | The white chalk towers and the wide valley. Keep the real white colour — no orange grading. |
| Kolsai Lakes | `kolsai-lakes` | A lake with forest reflections. Note which lake (lower / middle / upper) if you know it. |
| Charyn Canyon | `charyn-canyon` | Depth between red rock formations (Valley of Castles works well). |
| Kaindy Lake | `kaindy-lake` | Turquoise water with the drowned tree trunks clearly visible. |
| Singing Dune | `singing-dune` | The dune's clean ridge and the space around it — the dune itself, not a random Altyn-Emel view. |
| Burabay — Zhumbaktas | `burabay-zhumbaktas` | The Zhumbaktas rock in the lake, not just the wider Burabay area. |
| Big Almaty Lake | `big-almaty-lake` | The lake basin with the mountains behind. |
| Markakol Lake | `markakol-lake` | The lake with Altai forest and ridges — not a generic green lake. |
| Aktolagay Plateau | `aktolagay-plateau` | White chalk cliffs and figures above the steppe. Keep the chalk white. |

**Required:** one hero photo per destination. **Optional:** up to 3 gallery photos per destination.
If a gallery file is missing, the gallery simply shows fewer photos. If a hero is
missing, a calm "Photo pending" panel appears instead — never a broken image.

## 2. Size and format

- Format: **JPEG**, extension **`.jpg`** (lower-case). Other extensions will not be found.
- Hero: landscape, ideally **2500–4000 px wide**. Wide panoramas are fine.
- Gallery: **1600–2400 px wide**.
- Sharp, well-composed photos matter more than file size. Never upscale a small image.
- Keep the main subject away from the bottom-left corner of hero photos; that is where
  the title sits (Zhumbaktas is the exception — its title sits on the right).

## 3. Where to search

| Source | Search for | Licence notes |
| --- | --- | --- |
| [Wikimedia Commons](https://commons.wikimedia.org/) | `Kaindy lake`, `Charyn Canyon`, `Bozzhyra`, `Жумбактас`, `Поющий бархан` | Each file has its own licence (CC0, CC BY, CC BY-SA, public domain). Read it on the file page. |
| [Unsplash](https://unsplash.com/) | the destination name | Only the free **Unsplash License** photos. **Unsplash+** photos are paid — do not use them. |
| [Pexels](https://www.pexels.com/) | the destination name | Pexels License. Check the location is really the named place. |
| Your own photos, or a friend's with written permission | — | Record who gave permission and when. |

Do **not** use: Google Images results, tourism websites, Instagram, paid stock,
watermarked images, AI-generated landscapes, or photos of a different place.

Always check the place is correct — read the description, look for landmarks, and
compare with other photos. If unsure, leave the existing photo.

## 4. Download the original, not a thumbnail

- **Commons:** on the file page, click **"Original file"** (under the image), or
  "Download" → "Original file".
- **Unsplash:** click **Download** (the arrow next to it lets you choose "Original Size").
- **Pexels:** **Free download** → choose **Original**.

A right-click "Save image as" on a search results page usually saves a small preview.

## 5. Record the source and licence

After saving the file, open `src/content/destinations.ts`, find the destination,
and update the matching `media` entry:

```ts
{
  role: "gallery-02",
  alt: "Describe what is in the photo for someone who cannot see it",
  caption: "Short caption shown under the photo.",
  width: 2400,   // the real pixel size of your file
  height: 1600,
  focal: { desktop: "50% 50%", mobile: "50% 50%" }, // optional crop centre
  credit: {
    author: "Photographer name",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:...",
    via: "Wikimedia Commons", // or "Unsplash", "Pexels", "Own photo"
  },
},
```

`focal` sets which part of the photo stays visible when it is cropped:
`"30% 60%"` means 30% from the left, 60% from the top. `mobile` is used for tall
crops (phones and the portrait cards).

Then run `npm run test` — it checks that every hero file exists and that no
photo is used twice.

## 6. Seeing the change

- `npm run dev`: refresh the page. Image URLs carry a `?v=` version based on the
  file's modification time, so the optimizer never serves a stale cached copy.
- Production (`npm run build && npm run start`): rebuild, because the site checks
  which photos exist at build time.

## 7. Avoid extreme panoramas as heroes

A hero also appears as a 4:5 card and as a tall phone hero, so very wide
panoramas (2.5:1 or wider) get cropped to a narrow slice. Prefer 3:2 or 4:3
originals for heroes; put panoramas in the gallery instead.

## 8. Before you choose a hero, check its quality

The first Bozzhyra hero looked hazy because the photo itself had very little
tonal range (an overcast, low-contrast shot), and grey overlays made it worse.
A quick test with the `sharp` library that Next.js already installs:

```bash
node -e "require('sharp')('public/images/destinations/bozzhyra/hero.jpg').stats().then(s => console.log(s.channels.map(c => c.stdev.toFixed(0))))"
```

Standard deviations around 20–30 mean a flat, washed-out image; 45 or more
usually means good natural contrast. Also zoom in to 100% to check detail,
and avoid photos with watermarks.
