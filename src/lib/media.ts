import fs from "node:fs";
import path from "node:path";
import type { MediaRecord, ResolvedMedia } from "@/lib/types";

/**
 * Server-only helper: checks whether a photo file is actually present in
 * `public/`. Missing files render as a deliberate "Photo pending" panel, so
 * adding a correctly named file is enough to make it appear (after a rebuild
 * in production, or a refresh in development).
 *
 * The URL gets a `?v=` version taken from the file's modification time. The
 * Next.js image optimizer caches by URL, so without this a replaced photo
 * would keep showing the old cached version.
 */
export function resolveMedia(record: MediaRecord): ResolvedMedia {
  const filePath = path.join(process.cwd(), "public", ...record.src.split("/").filter(Boolean));
  try {
    const { mtimeMs } = fs.statSync(filePath);
    return { ...record, src: `${record.src}?v=${Math.floor(mtimeMs / 1000).toString(36)}`, available: true };
  } catch {
    return { ...record, available: false };
  }
}
