# Content verification checklist

Research for the first seven guides was carried out on **27 October 2026**, and for
Markakol Lake and the Aktolagay Plateau on **30 October 2026**, using the
sources listed on each guide page (and in `src/content/sources.ts`). Re-check the
items below before publishing, and at least once a season.

## Before each publication

- [ ] Every paragraph's claims are supported by a source in its `sourceIds`.
- [ ] Changeable details (fees, opening, vehicle access, permits, closures) are not
      stated as current facts; they point to an official source instead.
- [ ] Legends are labelled as legends.
- [ ] No unsupported numbers, superlatives, visitor statistics or safety promises.
- [ ] `verifiedOn` and each source's `accessedOn` are real dates when you checked.
- [ ] `npm run check` and `npm run build` pass.

## Known gaps and items to re-check

| Destination | Item | Why |
| --- | --- | --- |
| Charyn Canyon | Official park site (charyn.kz) | Returned errors on 27 Oct 2026; guide relies on reference sources. Re-check and add as a source when reachable. |
| Charyn Canyon | Canyon length, depth and age | Sources disagree widely, so they were omitted. Add only with a primary source. |
| Kolsai Lakes | Formation of the lakes | No citable official explanation found; the guide says so. |
| Kolsai Lakes | Which lake the hero photo shows | The Commons description only says "Kolsay lake". Caption avoids naming it. |
| Kolsai / Kaindy | Map reference points | Taken from Wikipedia (Kolsai) and Kazakhstan.travel (Kaindy). A park-published coordinate would be better. |
| Burabay — Zhumbaktas | Exact rock coordinate | No verified point for the rock itself; the map uses the park's reference point and says so. |
| Bozzhyra | Photo set (changed 27 Oct 2026) | Hero is now Ezra Sheyner's "Fangs of Boszhira" and gallery-01 is by Maksat79, both CC BY-SA 4.0. The earlier Berik Aday photos were removed because they were hazy. Both new files are identified as Bozzhyra by their Commons titles and category. Maksat79's file description also mentions the Zhabayushkan sanctuary; that status is **not** stated in the guide until it is verified. |
| Bozzhyra | Protected status | Based on a January 2025 news report of a regional statement. Watch for any new protection decision. |
| Singing Dune | Size figures | Taken from the official park page (≈3 km, ≈150 m). Wikipedia gives smaller figures. |
| Big Almaty Lake | Access, document checks, transport | Reported inconsistently; guide tells readers to confirm with the park. |
| Markakol Lake | Visitor rules and border-zone permits | The official portals list the reserve's office hours and a daily fee but no visitor rules; the regional portal flags a border area without details. The guide tells readers to contact the reserve. Confirm with the reserve administration. |
| Markakol Lake | Reserve area | Sources differ (71,367 ha on Kazakhstan.travel; 102,979 ha after the 2007 extension on Visit East; 164,408 ha for the UNESCO biosphere reserve). The guide gives no single figure. |
| Markakol Lake | District name | Kazakhstan.travel says Markakol District; Commons descriptions and older sources say Kurchum District. The guide follows the official portal. |
| Markakol Lake | Uskuch vs. Markakol lenok | The guide cites both names from their sources without equating them. Confirm with a fisheries or reserve source before stating they are the same fish. |
| Aktolagay Plateau | Coordinates | Kazakhstan.travel and Visit Aktobe give 47.494, 55.117; Russian Wikipedia gives 47.673, 55.157. The guide uses the official point and says it is only a reference on a 90 km ridge. |
| Aktolagay Plateau | Age of the rocks | Official sources call it Cretaceous chalk but also list whale vertebrae, which are younger; the guide gives no single age. |
| Aktolagay Plateau | Photo identification | All four photos are by one Commons contributor (PuzatikVu) and are identified by their titles and descriptions; none carries GPS data. |
| Big Almaty Lake | Hero photo (changed 30 Oct 2026) | Replaced the 8000 × 2720 px panorama by Igors Jefimovs, which could not fill tall cards or phone heroes without heavy cropping, with a 4000 × 3000 px geotagged photo by Жасминовый Дракон (CC BY-SA 4.0). |
| Katon-Karagay | Map reference point | Uses Wikipedia's approximate park point (49.3, 86.6). Kazakhstan.travel gives 49.1825, 85.5963, near the park's listed address in Katonkaragay village, which is not a sightseeing point. |
| Katon-Karagay | Border-zone rules | Not confirmed from an official source; the guide tells readers to ask the park. Rakhmanov Springs is named only in a photo caption, from the photographer's file title. |
| Torysh | Coordinates | Wikipedia (44.361, 51.561) and OpenStreetMap (44.367, 51.571) agree; Kazakhstan.travel lists 44.373, 51.978, about 33 km east, which looks like an error. The guide uses Wikipedia's point and says the sources differ. |
| Torysh | Age of the concretions | English Wikipedia says 120–180 million years, Russian Wikipedia 40–60 million; no age is given. |
| Torysh | Photographs | Only one verified photo (see PHOTO-GUIDE.md, "Missing photographs"). |
| Lake Balkhash | Regions on the southern shore | The northern shore (city of Balkhash) is in Karaganda Region. Sources disagree on which regions share the rest of the shore after the 2022 reorganisation (Almaty, Zhetisu and Zhambyl are all mentioned), so the guide says "shared by several regions". |
| Bayanaul & Jasybay | Rock type | Commonly called granite, but none of the sources consulted says so; the guide describes "weathered rock outcrops" instead. |
| Bayanaul & Jasybay | Map anchor | Uses the centre of Jasybay Lake from OpenStreetMap (50.818, 75.592; Russian Wikipedia agrees). Kazakhstan.travel's point (50.807, 75.442) is about 10 km west of the lake. |
| Aksu-Zhabagly | Official visitor rules | No official reserve website was reachable (aksu-jabagly.kz redirects to a ticketing blog). Permit and route information comes from Kazinform (May 2023). Confirm with the reserve administration. |
| Aksu-Zhabagly | World Heritage status | UNESCO's Western Tien-Shan listing names the Aksu-Zhabagly biosphere reserve as linked; the guide does not claim the whole reserve is a World Heritage component. |
| Photo credits page | Source summary | The `/photo-credits` page lists the platforms actually used (Wikimedia Commons, including files from Flickr and Panoramio). |
| All | Fees and online tickets | Not published on the site by design. |

## How to mark something as draft

Set `status: "draft"` and `verifiedOn: null` on the destination. The guide then
shows a "Draft content" notice, and the tests make sure no fake date remains.
