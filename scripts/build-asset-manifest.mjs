/**
 * Regenerates docs/ASSET-MANIFEST.md from src/content/destinations.ts, the
 * source of truth for every photo's credit, licence, size and focal points.
 *
 * Usage: node scripts/build-asset-manifest.mjs
 *
 * The dataset is TypeScript, so it is loaded with jiti (already installed as a
 * dependency of the toolchain) with the project's "@/" path alias.
 */
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const root = process.cwd();
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(root, "src") } });
const { destinations } = await jiti.import(path.join(root, "src/content/destinations.ts"));

const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const platforms = [...new Set(destinations.flatMap((d) => d.media.map((m) => m.credit.via)))];

const lines = [
  "# Asset manifest",
  "",
  `Snapshot generated from \`src/content/destinations.ts\` (the source of truth) by \`scripts/build-asset-manifest.mjs\`; last regenerated ${today}.`,
  `Files come from ${platforms.join(", ")}, where each licence and description were checked. Every file was resized for the web (heroes max 4000 px wide; gallery photos max 2400 px); any other change is listed under "Changes". Originals remain available at each source URL.`,
  "",
];

for (const d of destinations) {
  lines.push(`## ${d.name}`, "", "| Role | Local file | Size (px) | Photographer | Licence | Changes | Focal (desktop / mobile) | Source page |", "| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const m of d.media) {
    const file = path.join(root, "public", m.src);
    const exists = fs.existsSync(file);
    lines.push(
      `| ${m.role} | \`public${m.src}\`${exists ? "" : " (missing)"} | ${m.width}×${m.height} | ${m.credit.author} | ${m.credit.license} | ${m.credit.changes ?? "Resized"} | ${m.focal.desktop} / ${m.focal.mobile} | [${m.credit.via}](${m.credit.sourceUrl}) |`,
    );
  }
  lines.push("", "Alt text and captions:", "");
  for (const m of d.media) lines.push(`- **${m.role}:** ${m.alt}. *${m.caption}*`);
  if (d.media.length < 4) lines.push("", `Only ${d.media.length} verified photo${d.media.length === 1 ? "" : "s"}: see "Missing photographs" in docs/PHOTO-GUIDE.md.`);
  lines.push("");
}

lines.push(
  "## Attribution requirements",
  "",
  "- **CC BY / CC BY-SA:** credit the author, name the licence with a link, link the source, and state that the image was modified (resized or cropped). The site does this in each gallery caption and on the photo credits page (`/photo-credits`).",
  "- **CC BY-SA:** if you publish an *edited* version of the photo itself (crop, colour change), that edited image must also be shared under CC BY-SA. The cropped Katon-Karagay panoramas are such edits and are shared under the same licence.",
  "- **CC0 / public domain:** no attribution is legally required, but the site credits the author anyway.",
  "",
);

fs.writeFileSync(path.join(root, "docs", "ASSET-MANIFEST.md"), lines.join("\n"));
console.log(`docs/ASSET-MANIFEST.md: ${destinations.length} destinations, ${destinations.reduce((n, d) => n + d.media.length, 0)} photos`);
