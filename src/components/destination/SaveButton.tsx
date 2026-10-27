"use client";

import { Bookmark } from "lucide-react";
import { useSavedDestinations } from "@/lib/use-saved-destinations";

interface Props {
  id: string;
  name: string;
  /** "overlay": round icon button over a photo. "light"/"dark": labelled button. */
  variant?: "overlay" | "light" | "dark";
  className?: string;
}

export function SaveButton({ id, name, variant = "dark", className = "" }: Props) {
  const { isSaved, toggle, hydrated } = useSavedDestinations();
  const saved = isSaved(id);
  const label = saved ? `Remove ${name} from saved destinations` : `Save ${name}`;

  if (variant === "overlay") {
    return (
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={saved}
        aria-label={label}
        title={saved ? "Saved — select to remove" : "Save destination"}
        disabled={!hydrated}
        className={`on-dark grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55 active:scale-95 disabled:opacity-60 ${className}`}
      >
        <Bookmark className="size-[1.15rem]" fill={saved ? "currentColor" : "none"} strokeWidth={1.6} aria-hidden />
      </button>
    );
  }

  const tone =
    variant === "light"
      ? "on-dark border-white/60 text-white hover:bg-white hover:text-ink"
      : "border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper";

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={saved}
      aria-label={label}
      disabled={!hydrated}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition active:scale-[0.98] disabled:opacity-60 ${tone} ${className}`}
    >
      <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} strokeWidth={1.7} aria-hidden />
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
