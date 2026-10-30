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

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** Spells out small counts for running text ("nine destinations"); larger ones stay as digits. */
export function countWord(n: number, capitalise = false) {
  const word = NUMBER_WORDS[n] ?? String(n);
  return capitalise ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

/** Shrinks very long hero titles so they keep fitting on two lines. */
export function heroFit(name: string) {
  return Math.min(8.5, 120 / name.length);
}
