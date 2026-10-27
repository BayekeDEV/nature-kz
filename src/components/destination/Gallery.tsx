"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DestinationImage } from "@/components/media/DestinationImage";
import type { ResolvedMedia } from "@/lib/types";

interface Props {
  images: ResolvedMedia[];
  destinationName: string;
}

export function Gallery({ images, destinationName }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastOpened = useRef(0);

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
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button")];
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
      <p className="max-w-xl border-l-2 border-accent pl-4 text-muted">
        Gallery photographs for {destinationName} have not been added yet.
      </p>
    );
  }

  const current = openIndex === null ? null : images[openIndex];

  return (
    <>
      <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <li key={image.src}>
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
                className="group relative block aspect-[3/2] w-full cursor-zoom-in overflow-hidden bg-accent-wash"
              >
                <DestinationImage
                  media={image}
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw"
                  className="transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </button>
              <figcaption className="mt-3 text-[0.95rem] leading-snug text-ink-soft">
                {image.caption}
                <span className="mt-1 block text-[0.8rem] text-muted">
                  Photo: {image.credit.author} ·{" "}
                  {image.credit.licenseUrl ? (
                    <a href={image.credit.licenseUrl} className="underline hover:text-ink" rel="license noopener" target="_blank">
                      {image.credit.license}
                    </a>
                  ) : (
                    image.credit.license
                  )}{" "}
                  ·{" "}
                  <a href={image.credit.sourceUrl} className="underline hover:text-ink" rel="noopener" target="_blank">
                    Source
                  </a>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && openIndex !== null && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${destinationName} photo ${openIndex + 1} of ${images.length}`}
            className="on-dark fixed inset-0 z-[60] flex flex-col bg-night/95 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
              <p className="text-sm tabular-nums text-white/70" aria-live="polite">
                {openIndex + 1} / {images.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="grid size-11 place-items-center rounded-full hover:bg-white/10"
                aria-label="Close gallery"
              >
                <X className="size-6" strokeWidth={1.5} aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-20">
              <motion.div
                key={current.src}
                className="relative h-full max-h-full w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <Image src={current.src} alt={current.alt} fill sizes="100vw" quality={82} className="object-contain" />
              </motion.div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photo"
                    className="absolute left-2 grid size-12 place-items-center rounded-full bg-black/40 hover:bg-black/60 md:left-6"
                  >
                    <ChevronLeft className="size-6" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photo"
                    className="absolute right-2 grid size-12 place-items-center rounded-full bg-black/40 hover:bg-black/60 md:right-6"
                  >
                    <ChevronRight className="size-6" aria-hidden />
                  </button>
                </>
              )}
            </div>

            <div className="mx-auto w-full max-w-3xl px-4 py-5 text-center">
              <p className="text-[0.98rem]">{current.caption}</p>
              <p className="mt-1 text-xs text-white/65">
                Photo: {current.credit.author} · {current.credit.license} · via {current.credit.via}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
