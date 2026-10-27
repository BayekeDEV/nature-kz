/** Formats an ISO date (YYYY-MM-DD) as "27 October 2026" without timezone drift. */
export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Shrinks very long hero titles so they keep fitting on two lines. */
export function heroFit(name: string) {
  return Math.min(8.5, 120 / name.length);
}
