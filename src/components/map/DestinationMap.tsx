"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { KAZAKHSTAN_OUTLINE_PATH } from "@/content/kazakhstan-outline";
import {
  clampView,
  focusView,
  INITIAL_VIEW,
  MAX_SCALE,
  MIN_SCALE,
  roomyLabels,
  toScreen,
  viewBox,
  type MapPoint,
  type MapView,
} from "@/lib/map-points";

interface Props {
  points: MapPoint[];
  title: string;
  /** Destination selected when the map first renders (its guide page). */
  initialSlug?: string;
  /** Show the synchronised list of destination names below the map. */
  showList?: boolean;
}

const ZOOM_STEP = 1.8;

/**
 * Schematic map of Kazakhstan with every destination as its own marker.
 *
 * Markers sit exactly where the published coordinates project onto the same
 * outline (see src/lib/map.ts); nothing is nudged apart. Close neighbours in
 * the south-east are separated by zooming, not by moving them:
 * - choosing a marker or a name in the list centres the map and zooms in just
 *   enough to tell that marker apart from its nearest neighbour;
 * - zoom buttons, reset, dragging and arrow keys move the view;
 * - the mouse wheel is left alone, so the page always scrolls normally.
 * Names are shown permanently when they have room, and on hover, focus or
 * selection otherwise. A details panel below the map links to the guide.
 */
export function DestinationMap({ points, title, initialSlug, showList = false }: Props) {
  const [view, setView] = useState<MapView>(INITIAL_VIEW);
  const [selected, setSelected] = useState<string | null>(initialSlug ?? null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const surfaceRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; view: MapView; moved: boolean } | null>(null);
  const frame = useRef<number | null>(null);
  const hintId = useId();
  const panelId = useId();

  // Track the drawn size so labels and zoom-to-separate use real pixels.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const box = viewBox(view);
  const zoomed = box.scale > MIN_SCALE + 0.001;
  const roomy = useMemo(() => (size.w ? roomyLabels(points, view, size.w, size.h) : new Set<string>()), [points, view, size]);
  const selectedPoint = points.find((p) => p.slug === selected) ?? null;

  const zoomBy = useCallback((factor: number) => {
    setView((v) => clampView({ ...v, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor)) }));
  }, []);

  const select = useCallback(
    (slug: string) => {
      const point = points.find((p) => p.slug === slug);
      if (!point) return;
      setSelected(slug);
      setView(focusView(point, points, size.w || 800));
    },
    [points, size.w],
  );

  const reset = () => setView(INITIAL_VIEW);

  /* Drag to pan (only when zoomed, so touch scrolling is untouched at full view). */
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!zoomed || event.button !== 0 || (event.target as HTMLElement).closest("button, a")) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, view, moved: false };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId || !size.w) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 4) return;
    if (!start.moved) {
      start.moved = true;
      surfaceRef.current?.setPointerCapture(event.pointerId);
    }
    const startBox = viewBox(start.view);
    const next = clampView({ ...start.view, cx: start.view.cx - (dx / size.w) * startBox.w, cy: start.view.cy - (dy / size.h) * startBox.h });
    // At most one React update per animation frame while dragging.
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setView(next);
    });
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === event.pointerId) drag.current = null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const step = 0.15;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (event.key in moves && zoomed) {
      event.preventDefault();
      const [mx, my] = moves[event.key];
      setView((v) => {
        const b = viewBox(v);
        return clampView({ ...v, cx: v.cx + mx * b.w * step, cy: v.cy + my * b.h * step });
      });
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomBy(ZOOM_STEP);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomBy(1 / ZOOM_STEP);
    } else if (event.key === "0") {
      event.preventDefault();
      reset();
    }
  }

  return (
    <div role="group" aria-label={title} className="grid gap-4">
      <div
        ref={surfaceRef}
        tabIndex={0}
        aria-label={`${title}. Map view, ${box.scale.toFixed(1)}× zoom.`}
        aria-describedby={hintId}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative aspect-[1012/559] w-full overflow-hidden rounded-sm border border-line bg-raised outline-offset-2 select-none ${
          zoomed ? "cursor-grab touch-none active:cursor-grabbing" : "touch-pan-y"
        }`}
      >
        <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} aria-hidden className="absolute inset-0 block h-full w-full" preserveAspectRatio="none">
          <path
            d={KAZAKHSTAN_OUTLINE_PATH}
            className="fill-fg/[0.07] stroke-fg/40"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>

        <ul>
          {points.map((point) => {
            const pos = size.w ? toScreen(point, view, size.w, size.h) : toScreen(point, INITIAL_VIEW, 100, 100);
            const unit = size.w ? "px" : "%";
            const inside = !size.w || (pos.left >= -8 && pos.left <= size.w + 8 && pos.top >= -8 && pos.top <= size.h + 8);
            const isSelected = point.slug === selected;
            const showLabel = isSelected || hovered === point.slug || roomy.has(point.slug);
            const labelLeft = size.w ? pos.left + 26 + point.name.length * 7.4 < size.w - 4 : true;
            return (
              <li
                key={point.slug}
                className="absolute"
                style={{ left: `${pos.left}${unit}`, top: `${pos.top}${unit}`, zIndex: isSelected ? 3 : hovered === point.slug ? 2 : 1 }}
                hidden={!inside}
              >
                <button
                  type="button"
                  onClick={() => select(point.slug)}
                  onPointerEnter={() => setHovered(point.slug)}
                  onPointerLeave={() => setHovered((h) => (h === point.slug ? null : h))}
                  onFocus={() => setHovered(point.slug)}
                  onBlur={() => setHovered((h) => (h === point.slug ? null : h))}
                  aria-pressed={isSelected}
                  aria-controls={panelId}
                  aria-label={`${point.number}. ${point.name}, ${point.region}`}
                  className="group absolute top-0 left-0 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none"
                >
                  <span
                    aria-hidden
                    className={`grid place-items-center rounded-full border-2 font-semibold text-[#14110D] shadow-sm transition-[transform,box-shadow] duration-200 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-fg group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-raised ${
                      isSelected ? "size-6 border-fg text-[0.7rem] ring-4 ring-fg/25" : "size-5 border-page text-[0.62rem]"
                    }`}
                    style={{ backgroundColor: point.accent }}
                  >
                    {point.number}
                  </span>
                  {showLabel && (
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-sm px-1.5 py-0.5 text-[0.8rem] leading-tight font-medium whitespace-nowrap text-fg sm:text-[0.85rem] ${
                        labelLeft ? "left-full ml-0.5" : "right-full mr-0.5"
                      } ${isSelected || hovered === point.slug ? "bg-page/90 shadow-sm" : ""}`}
                    >
                      {point.name}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="absolute right-2 bottom-2 flex overflow-hidden rounded-md border border-line bg-page/90 shadow-sm backdrop-blur-sm sm:top-2 sm:bottom-auto sm:flex-col">
          <button type="button" onClick={() => zoomBy(ZOOM_STEP)} disabled={box.scale >= MAX_SCALE} aria-label="Zoom in" className="grid size-11 place-items-center hover:bg-fg/10 disabled:opacity-40">
            <Plus className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={!zoomed} aria-label="Zoom out" className="grid size-11 place-items-center border-l border-line hover:bg-fg/10 disabled:opacity-40 sm:border-t sm:border-l-0">
            <Minus className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={reset} disabled={!zoomed} aria-label="Reset map view" className="grid size-11 place-items-center border-l border-line hover:bg-fg/10 disabled:opacity-40 sm:border-t sm:border-l-0">
            <RotateCcw className="size-[1.1rem]" aria-hidden />
          </button>
        </div>
      </div>

      <p id={hintId} className="text-xs text-fg-muted">
        Schematic overview, not for navigation. Select a marker{showList ? " or a name below" : ""} to zoom to it; use + and − to zoom and drag
        or the arrow keys to move. Country outline: Natural Earth (public domain).
      </p>

      <div id={panelId} aria-live="polite" className="min-h-[5.5rem] border-l-2 border-accent bg-raised/70 px-4 py-3">
        {selectedPoint ? (
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div>
              <p className="font-display text-[1.45rem] leading-tight text-fg">{selectedPoint.name}</p>
              <p className="mt-0.5 text-sm text-fg-muted">{selectedPoint.region}</p>
              <p className="mt-1 max-w-[60ch] text-xs text-fg-muted">{selectedPoint.coordinates.represents}.</p>
            </div>
            {selectedPoint.slug === initialSlug ? (
              <p className="text-sm text-fg-muted">You are reading this guide.</p>
            ) : (
              <Link
                href={`/destinations/${selectedPoint.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-fg/40 px-5 text-sm font-medium hover:border-fg hover:bg-fg hover:text-page"
              >
                Explore destination
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>
        ) : (
          <p className="text-sm text-fg-muted">Select a destination on the map{showList ? " or in the list" : ""} to see where it is.</p>
        )}
      </div>

      {showList && (
        <ul aria-label="Destinations on the map" className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point) => (
            <li key={point.slug}>
              <button
                type="button"
                onClick={() => select(point.slug)}
                aria-pressed={point.slug === selected}
                aria-controls={panelId}
                className="flex min-h-11 w-full items-center gap-3 border-b border-line py-2 text-left text-[0.95rem] hover:text-accent-fg aria-pressed:text-accent-fg"
              >
                <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full text-[0.62rem] font-semibold text-[#14110D]" style={{ backgroundColor: point.accent }}>
                  {point.number}
                </span>
                <span className="font-medium">{point.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
