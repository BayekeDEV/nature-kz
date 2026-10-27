# Content verification checklist

Research for all seven guides was carried out on **27 October 2026** using the
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
| Bozzhyra | Protected status | Based on a January 2025 news report of a regional statement. Watch for any new protection decision. |
| Singing Dune | Size figures | Taken from the official park page (≈3 km, ≈150 m). Wikipedia gives smaller figures. |
| Big Almaty Lake | Access, document checks, transport | Reported inconsistently; guide tells readers to confirm with the park. |
| All | Fees and online tickets | Not published on the site by design. |

## How to mark something as draft

Set `status: "draft"` and `verifiedOn: null` on the destination. The guide then
shows a "Draft content" notice, and the tests make sure no fake date remains.
