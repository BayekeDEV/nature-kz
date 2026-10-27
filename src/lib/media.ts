import fs from "node:fs";
import path from "node:path";
import type { MediaRecord, ResolvedMedia } from "@/lib/types";

/**
 * Server-only helper: checks whether a photo file is actually present in
 * `public/`. Missing files render as a deliberate "Photo pending" panel, so
 * adding a correctly named file is enough to make it appear (after a rebuild
 * in production, or a refresh in development).
 */
export function resolveMedia(record: MediaRecord): ResolvedMedia {
  const filePath = path.join(process.cwd(), "public", ...record.src.split("/").filter(Boolean));
  return { ...record, available: fs.existsSync(filePath) };
}
