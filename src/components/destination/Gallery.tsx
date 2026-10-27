"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DestinationImage } from "@/components/media/DestinationImage";
import { useHydrated } from "@/lib/use-saved-destinations";
import { themeVars } from "@/lib/theme";
import type { DestinationTheme, ResolvedMedia } from "@/lib/types";

interface Props {
  images: ResolvedMedia[];
  destinationName: string;
  /** Applied to the lightbox, which is portalled outside the themed page wrapper. */
  theme: DestinationTheme;
}

export function Gallery({ images, destinationName, theme }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastOpened = useRef(0);
  // The lightbox portal needs document.body, which only exists after hydration.
  const hydrated = useHydrated();

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRefs.current[lastOpened.current]?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  // Close if the page is hidden by navigation (Next keeps recent pages mounted).
  useLayoutEffect(() => () => setOpenIndex(null), []);

  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight") {
        step(1);
      } else if (event.key === "ArrowLeft") {
        step(-1);
      } else if (event.key === "Tab" && dialogRef.current) {
        // Only visible buttons: the phone and desktop arrow sets are hidden at the other size.
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button")].filter((el) => el.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // Depends on isOpen (not openIndex) so focus is not reset on every image change.
  }, [isOpen, close, step]);

  if (images.length === 0) {
    return (
      <p className="max-w-xl border-l-2 border-accent pl-4 text-fg-muted">
        Gallery photographs for {destinationName} have not been added yet.
      </p>
    );
  }

  const current = openIndex === null ? null : images[openIndex];
  const layout = GALLERY_LAYOUTS[Math.min(images.length, 3)];

  return (
    <>
      {/* Editorial layout: one lead photo with the others alongside (stacked on phones). */}
      <ul className={`grid gap-x-6 gap-y-10 ${layout.grid}`}>
        {images.map((image, index) => (
          <li key={image.src} className={index === 0 ? layout.lead : ""}>
            <figure>
              <button
                ref={(el) => {
                  triggerRefs.current[index] = el;
                }}
                type="button"
                onClick={() => {
                  lastOpened.current = index;
                  setOpenIndex(index);
                }}
                aria-haspopup="dialog"
                aria-label={`Enlarge photo ${index + 1} of ${images.length}: ${image.caption}`}
                className={`group relative block w-full cursor-zoom-in overflow-hidden bg-accent-wash outline-offset-4 ${
                  index === 0 ? layout.leadAspect : "aspect-[3/2]"
                }`}
              >
                <DestinationImage
                  media={image}
                  sizes={index === 0 ? "(min-width: 768px) 62vw, 100vw" : "(min-width: 768px) 32vw, 100vw"}
                  className="transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <span aria-hidden className="absolute inset-0 ring-1 ring-fg/10 ring-inset" />
              </button>
              <figcaption className="mt-3 max-w-[60ch] text-[0.95rem] leading-snug text-fg-soft">
                {image.caption}
                <span className="mt-1 block text-[0.82rem] text-fg-muted">
                  Photo: {image.credit.author} ·{" "}
                  {image.credit.licenseUrl ? (
                    <a href={image.credit.licenseUrl} className="underline hover:text-fg" rel="license noopener" target="_blank">
                      {image.credit.license}
                    </a>
                  ) : (
                    image.credit.license
                  )}{" "}
                  ·{" "}
                  <a href={image.credit.sourceUrl} className="underline hover:text-fg" rel="noopener" target="_blank">
                    Source
                  </a>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {/* Portalled to <body> so no page-level transform or stacking context can cover it. */}
      {hydrated &&
        createPortal(
          <AnimatePresence>
            {current && openIndex !== null && (
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={`${destinationName}: photo ${openIndex + 1} of ${images.length}`}
                style={themeVars(theme)}
                className="fixed inset-0 z-[60] flex flex-col bg-deep/[0.97] text-fg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
                  <p className="text-sm tabular-nums text-fg-muted" aria-live="polite">
                    {openIndex + 1} of {images.length}
                  </p>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    className="grid size-11 place-items-center rounded-full border border-line hover:bg-fg/10"
                    aria-label="Close gallery"
                  >
                    <X className="size-6" strokeWidth={1.5} aria-hidden />
                  </button>
                </div>

                <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-24">
                  <motion.div
                    key={current.src}
                    className="relative h-full max-h-full w-full"
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.28 }}
                  >
                    <Image src={current.src} alt={current.alt} fill sizes="100vw" quality={82} className="object-contain" />
                  </motion.div>
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous photo"
                        className="absolute left-2 hidden size-12 place-items-center rounded-full border border-line bg-page/70 hover:bg-raised md:left-6 md:grid"
                      >
                        <ChevronLeft className="size-6" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next photo"
                        className="absolute right-2 hidden size-12 place-items-center rounded-full border border-line bg-page/70 hover:bg-raised md:right-6 md:grid"
                      >
                        <ChevronRight className="size-6" aria-hidden />
                      </button>
                    </>
                  )}
                </div>

                <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-4 md:py-5">
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous photo"
                      className="grid size-12 shrink-0 place-items-center rounded-full border border-line md:hidden"
                    >
                      <ChevronLeft className="size-6" aria-hidden />
                    </button>
                  )}
                  <div className="flex-1 text-center">
                    <p className="text-[0.98rem] text-fg">{current.caption}</p>
                    <p className="mt-1 text-xs text-fg-muted">
                      Photo: {current.credit.author} · {current.credit.license} · via {current.credit.via}
                    </p>
                  </div>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next photo"
                      className="grid size-12 shrink-0 place-items-center rounded-full border border-line md:hidden"
                    >
                      <ChevronRight className="size-6" aria-hidden />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

/** Grid classes by number of photos (1, 2 or 3+). */
const GALLERY_LAYOUTS: Record<number, { grid: string; lead: string; leadAspect: string }> = {
  1: { grid: "", lead: "", leadAspect: "aspect-[3/2] md:aspect-[2/1]" },
  2: { grid: "md:grid-cols-2", lead: "", leadAspect: "aspect-[3/2]" },
  3: {
    grid: "md:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] md:items-start",
    lead: "md:row-span-2",
    leadAspect: "aspect-[3/2] md:aspect-[4/3]",
  },
};
