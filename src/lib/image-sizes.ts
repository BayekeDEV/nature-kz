/**
 * Builds an accurate `sizes` attribute for photos shown with `object-fit: cover`.
 *
 * `sizes` normally describes the width of the box. But when a wide photo fills
 * a tall box (a 3:2 landscape in a 4:5 card, or any photo in a phone-height
 * hero), the photo is scaled to the box's *height* and drawn much wider than
 * the box. If `sizes` only states the box width, the browser downloads a file
 * that is too small and the photo looks soft or pixelated.
 *
 * Each rule says how wide the box is (in vw or px) and how tall it is relative
 * to its width (`frame` = height / width). The rendered width is then
 * box width × max(1, frame × photo aspect ratio).
 */
export interface FrameRule {
  /** Media condition, e.g. "(min-width: 1024px)". Omit for the final fallback rule. */
  media?: string;
  /** Box width as a percentage of the viewport width. */
  vw?: number;
  /** Box width in CSS pixels (used when `vw` is not given). */
  px?: number;
  /** Box height divided by box width (4:5 card = 1.25, 3:2 tile = 0.667). */
  frame: number;
}

export function coverScale(image: { width: number; height: number }, frame: number) {
  return Math.max(1, frame * (image.width / image.height));
}

export function coverSizes(image: { width: number; height: number }, rules: FrameRule[]): string {
  return rules
    .map((rule) => {
      const scale = coverScale(image, rule.frame);
      const length = rule.vw !== undefined ? `${Math.ceil(rule.vw * scale)}vw` : `${Math.ceil((rule.px ?? 0) * scale)}px`;
      return rule.media ? `${rule.media} ${length}` : length;
    })
    .join(", ");
}

/*
 * Frame rules for each place a destination photo appears. The numbers mirror
 * the Tailwind classes on the components that use them.
 */

/** DestinationCard: 4:3 on phones, 4:5 from md; 1, 2 or 3 columns. */
export const CARD_FRAMES: FrameRule[] = [
  { media: "(min-width: 1024px)", vw: 30, frame: 5 / 4 },
  { media: "(min-width: 768px)", vw: 46, frame: 5 / 4 },
  { vw: 100, frame: 3 / 4 },
];

/**
 * PhotoHero: full width, ~92–100svh tall plus 8% overscan. Portrait phones and
 * tablets make the box much taller than wide, which is where under-sizing hurt most.
 */
export const HERO_FRAMES: FrameRule[] = [
  { media: "(max-width: 767px) and (orientation: portrait)", vw: 100, frame: 2.2 },
  { media: "(max-width: 1279px) and (orientation: portrait)", vw: 100, frame: 1.4 },
  { vw: 100, frame: 0.72 },
];

/** Gallery lead tile: 3:2 on phones, 4:3 in a ~62vw column on desktop. */
export const GALLERY_LEAD_FRAMES: FrameRule[] = [
  { media: "(min-width: 768px)", vw: 62, frame: 3 / 4 },
  { vw: 100, frame: 2 / 3 },
];

/** Gallery side tiles: 3:2 everywhere. */
export const GALLERY_TILE_FRAMES: FrameRule[] = [
  { media: "(min-width: 768px)", vw: 33, frame: 2 / 3 },
  { vw: 100, frame: 2 / 3 },
];

/** Saved list thumbnails: fixed 4:3 boxes, 104px on phones and 160px from sm. */
export const SAVED_THUMB_FRAMES: FrameRule[] = [
  { media: "(min-width: 640px)", px: 160, frame: 3 / 4 },
  { px: 104, frame: 3 / 4 },
];
