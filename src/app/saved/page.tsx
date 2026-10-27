import type { Metadata } from "next";
import { SavedList } from "@/components/saved/SavedList";
import { getDestinationSummaries } from "@/lib/destinations";

export const metadata: Metadata = {
  title: "Saved destinations",
  description: "Destinations you have saved in this browser.",
};

export default function SavedPage() {
  return (
    <div className="page-glow pt-[var(--header-height)]">
      <header className="page-container pt-16 pb-10 md:pt-24 md:pb-12">
        <p className="eyebrow text-fg-muted">Your list</p>
        <h1 className="mt-4 font-display text-[clamp(2.75rem,2rem+3.5vw,5.5rem)] leading-[0.95] font-medium">Saved destinations</h1>
        <p className="mt-6 max-w-[60ch] text-[1.05rem] leading-relaxed text-fg-soft">
          Saves are stored only in this browser on this device. They are not linked to an account and are not synced anywhere;
          clearing your browser data removes them.
        </p>
      </header>
      <SavedList destinations={getDestinationSummaries()} />
    </div>
  );
}
