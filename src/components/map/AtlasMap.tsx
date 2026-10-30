"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowRight, Crosshair, Maximize2, Minimize2, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { atlasStyle, MARKER_SPACE } from "@/components/map/atlas-style";
import { StaticAtlas } from "@/components/map/StaticAtlas";
import { ATLAS_BOUNDS, ATLAS_CREDITS, KAZAKHSTAN_BOUNDS } from "@/content/atlas";
import { distanceKm, zoomToSeparate, type AtlasPoint } from "@/lib/atlas";

interface Props {
  points: AtlasPoint[];
  title: string;
}

type Status = "loading" | "ready" | "failed";
interface Preview {
  slug: string;
  below: boolean;
  /** Horizontal shift (px) that keeps the card inside the map. */
  shift: number;
}

const PREVIEW_WIDTH = 240;
/** Space around Kazakhstan in the initial view; on narrow maps, keep markers clear of the controls. */
const fitPadding = (width: number) => ({ top: 36, bottom: 36, left: 24, right: width < 1024 ? 72 : 28 });
/** Panning stops at the edge of the relief image. */
const PAN_LIMIT: [[number, number], [number, number]] = [
  [ATLAS_BOUNDS.west, ATLAS_BOUNDS.south],
  [ATLAS_BOUNDS.east, ATLAS_BOUNDS.north],
];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL2() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/** Zoom that shows a destination clearly apart from its nearest neighbour. */
function locateZoom(point: AtlasPoint, points: AtlasPoint[]) {
  const nearest = Math.min(...points.filter((p) => p !== point).map((p) => distanceKm(p.coordinates, point.coordinates)));
  return Math.min(9.5, Math.max(6, zoomToSeparate(nearest, 110, point.coordinates.lat)));
}

/**
 * The interactive landscape atlas (MapLibre GL JS, loaded on demand).
 *
 * - Every destination is an HTML marker at its published coordinate, rendered
 *   as a real link to its guide. Hover or keyboard focus shows a preview card.
 * - Names are a MapLibre symbol layer, so crowded names hide automatically and
 *   appear as you zoom in; markers are never moved.
 * - The list below links to each guide and can fly the map to a destination.
 * - Two-finger / Ctrl + scroll gestures keep the page scrolling normally.
 * - If WebGL or the map fails, a static version with the same links is shown.
 */
export function AtlasMap({ points, title }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pointsRef = useRef(points);
  const closeTimer = useRef<number | undefined>(undefined);
  const [status, setStatus] = useState<Status>("loading");
  const [hosts, setHosts] = useState<Record<string, HTMLElement> | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const locate = useCallback((slug: string, { focus = true, instant = false } = {}) => {
    const map = mapRef.current;
    const point = pointsRef.current.find((p) => p.slug === slug);
    if (!map || !point) return;
    const reduced = prefersReducedMotion();
    setActive(slug);
    window.history.replaceState(null, "", `#${slug}`);
    if (focus) frameRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    const camera = { center: [point.coordinates.lon, point.coordinates.lat] as [number, number], zoom: locateZoom(point, pointsRef.current) };
    if (focus) {
      map.once("moveend", () => {
        containerRef.current?.querySelector<HTMLAnchorElement>(`a[data-slug="${slug}"]`)?.focus({ preventScroll: true });
      });
    }
    if (reduced || instant) map.jumpTo(camera);
    else map.flyTo({ ...camera, duration: 1600 });
  }, []);

  const reset = () => {
    setActive(null);
    setPreview(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    mapRef.current?.fitBounds(KAZAKHSTAN_BOUNDS, { padding: fitPadding(containerRef.current?.clientWidth ?? 1000), duration: prefersReducedMotion() ? 0 : 900 });
  };

  /* Create the map once. Nothing here depends on later renders, so the view is never reset behind the user's back. */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const markers: Marker[] = [];
    const fail = (reason: unknown) => {
      if (cancelled) return;
      console.warn("Interactive map unavailable, showing the static map instead:", reason);
      setStatus("failed");
    };

    if (!supportsWebGL2()) {
      // Deferred so the state update does not happen synchronously inside the effect.
      queueMicrotask(() => fail("WebGL2 is not available"));
      return () => {
        cancelled = true;
      };
    }
    // Hidden tabs and covered windows pause map rendering. Only give up if the
    // page is actually drawing frames (checked with one animation frame) and the map still has not loaded.
    let timeout = 0;
    const armTimeout = () => {
      timeout = window.setTimeout(() => {
        let drawing = false;
        requestAnimationFrame(() => (drawing = true));
        timeout = window.setTimeout(() => (drawing ? fail("the map took too long to load") : armTimeout()), 1000);
      }, 25000);
    };
    armTimeout();

    import("maplibre-gl")
      .then((maplibregl) => {
        if (cancelled) return;
        // Let the bundler emit MapLibre's worker file and tell MapLibre where it ended up.
        maplibregl.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
        const instance = new maplibregl.Map({
          container,
          style: atlasStyle(pointsRef.current, window.location.origin),
          bounds: KAZAKHSTAN_BOUNDS,
          fitBoundsOptions: { padding: fitPadding(container.clientWidth) },
          maxBounds: PAN_LIMIT,
          maxZoom: 10,
          maxPitch: 0,
          dragRotate: false,
          touchPitch: false,
          pitchWithRotate: false,
          renderWorldCopies: false,
          cooperativeGestures: true,
          attributionControl: false,
          fadeDuration: prefersReducedMotion() ? 0 : 200,
          locale: { "Map.Title": title },
        });
        map = instance;
        mapRef.current = instance;
        instance.touchZoomRotate.disableRotation();
        instance.keyboard.disableRotation();
        // An empty icon the size of a marker, so map labels keep clear of the HTML markers.
        instance.setMissingStyleImageResolver((id) => {
          if (id === MARKER_SPACE.id && !instance.hasImage(id)) {
            instance.addImage(id, { width: MARKER_SPACE.size, height: MARKER_SPACE.size, data: new Uint8Array(MARKER_SPACE.size ** 2 * 4) });
          }
        });

        const elements: Record<string, HTMLElement> = {};
        for (const point of pointsRef.current) {
          const element = document.createElement("div");
          const marker = new maplibregl.Marker({ element, anchor: "center" }).setLngLat([point.coordinates.lon, point.coordinates.lat]).addTo(instance);
          // The link inside carries the accessible name.
          element.removeAttribute("aria-label");
          element.removeAttribute("role");
          elements[point.slug] = element;
          markers.push(marker);
        }
        setHosts(elements);

        instance.on("load", () => {
          window.clearTimeout(timeout);
          if (cancelled) return;
          instance.setMinZoom(Math.max(0, instance.getZoom() - 0.5));
          setStatus("ready");
          const slug = decodeURIComponent(window.location.hash.slice(1));
          if (pointsRef.current.some((p) => p.slug === slug)) locate(slug, { focus: false, instant: true });
        });
        instance.on("error", (event) => {
          const sourceId = (event as { sourceId?: string }).sourceId;
          // Finer relief is optional: if those tiles fail, the self-hosted map is still complete.
          if (sourceId === "terrain") return;
          console.warn("Map error", sourceId ?? "", event.error);
        });
        instance.getCanvas().addEventListener("webglcontextlost", () => fail("the WebGL context was lost"));
      })
      .catch(fail);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      for (const marker of markers) marker.remove();
      map?.remove();
      mapRef.current = null;
    };
  }, [locate, title]);

  useEffect(() => {
    const frame = frameRef.current;
    setCanFullscreen(Boolean(document.fullscreenEnabled && frame?.requestFullscreen));
    const onChange = () => setFullscreen(document.fullscreenElement === frame);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Keep the marker with an open preview (or the located one) above its neighbours.
  useEffect(() => {
    if (!hosts) return;
    for (const [slug, host] of Object.entries(hosts)) host.style.zIndex = slug === preview?.slug ? "3" : slug === active ? "2" : "1";
  }, [hosts, preview, active]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function openPreview(point: AtlasPoint) {
    window.clearTimeout(closeTimer.current);
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;
    const { x, y } = map.project([point.coordinates.lon, point.coordinates.lat]);
    const left = x - PREVIEW_WIDTH / 2;
    const shift = Math.max(8 - left, Math.min(0, container.clientWidth - 8 - (left + PREVIEW_WIDTH)));
    setPreview({ slug: point.slug, below: y < 230, shift });
  }

  function closePreview(delay = 140) {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPreview(null), delay);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen();
  }

  const controlClass = "grid size-11 place-items-center text-fg hover:bg-fg/10 disabled:opacity-40";

  return (
    <div className="grid gap-8">
      {status === "failed" ? (
        <div className="grid gap-3">
          <StaticAtlas points={points} title={title} />
          <p role="status" className="text-sm text-fg-muted">
            The interactive map could not start in this browser, so a static map is shown. Every marker and every name below still
            opens its guide.
          </p>
        </div>
      ) : (
        <div ref={frameRef} className="flex flex-col gap-2 bg-page [&:fullscreen]:p-3">
          <div
            className="relative aspect-[5/4] w-full overflow-hidden rounded-sm border border-line bg-[#16140f] sm:aspect-[16/10] lg:aspect-auto lg:h-[min(74vh,760px)] [:fullscreen_&]:aspect-auto [:fullscreen_&]:flex-1"
          >
            {/* MapLibre makes this element position: relative, so it is sized with h-full rather than inset-0. */}
            <div ref={containerRef} className={`atlas-map h-full w-full ${status === "ready" ? "" : "[&_.maplibregl-marker]:invisible"}`} />

            {status === "loading" && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#16140f]" aria-hidden>
                <span className="eyebrow animate-pulse text-fg-muted motion-reduce:animate-none">Loading map</span>
              </div>
            )}

            <div className="absolute top-2 right-2 flex flex-col overflow-hidden rounded-md border border-line bg-page/90 shadow-sm backdrop-blur-sm">
              <button type="button" onClick={() => mapRef.current?.zoomIn()} disabled={status !== "ready"} aria-label="Zoom in" className={controlClass}>
                <Plus className="size-5" aria-hidden />
              </button>
              <button type="button" onClick={() => mapRef.current?.zoomOut()} disabled={status !== "ready"} aria-label="Zoom out" className={`${controlClass} border-t border-line`}>
                <Minus className="size-5" aria-hidden />
              </button>
              <button type="button" onClick={reset} disabled={status !== "ready"} aria-label="Reset map view" className={`${controlClass} border-t border-line`}>
                <RotateCcw className="size-[1.1rem]" aria-hidden />
              </button>
              {canFullscreen && (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                  className={`${controlClass} hidden border-t border-line sm:grid`}
                >
                  {fullscreen ? <Minimize2 className="size-[1.1rem]" aria-hidden /> : <Maximize2 className="size-[1.1rem]" aria-hidden />}
                </button>
              )}
            </div>
          </div>

          <p className="text-[0.72rem] leading-snug text-fg-muted">
            {ATLAS_CREDITS.map((credit, index) => (
              <span key={credit.href}>
                {index > 0 && " · Relief detail: "}
                <a href={credit.href} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-fg">
                  {credit.label}
                </a>
                {credit.note && ` ${credit.note}`}
              </span>
            ))}
          </p>
        </div>
      )}

      {hosts &&
        status !== "failed" &&
        points.map((point) => {
          const host = hosts[point.slug];
          if (!host) return null;
          const open = preview?.slug === point.slug;
          return createPortal(
            <div
              onPointerEnter={(event) => event.pointerType === "mouse" && openPreview(point)}
              onPointerLeave={(event) => event.pointerType === "mouse" && closePreview()}
            >
              <Link
                href={`/destinations/${point.slug}`}
                data-slug={point.slug}
                aria-label={`${point.name}, ${point.region}. Open the guide.`}
                onFocus={() => openPreview(point)}
                onBlur={() => closePreview(0)}
                onKeyDown={(event) => event.key === "Escape" && setPreview(null)}
                className="group grid size-9 place-items-center rounded-full outline-none"
              >
                {point.slug === active && (
                  <span aria-hidden className="absolute size-7 rounded-full border-2 border-[#fbf6ec]/80 motion-safe:animate-ping" />
                )}
                <span
                  aria-hidden
                  className={`grid place-items-center rounded-full border-2 text-[0.66rem] font-semibold text-[#14110d] shadow-[0_1px_5px_rgba(0,0,0,0.55)] transition-transform duration-200 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-[#fbf6ec] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#14110d] ${
                    point.slug === active || open ? "size-7 border-[#fbf6ec]" : "size-6 border-[#14110d]"
                  }`}
                  style={{ backgroundColor: point.accent }}
                >
                  {point.number}
                </span>
              </Link>
              {open && (
                <div
                  className={`absolute left-1/2 ${preview.below ? "top-full pt-2" : "bottom-full pb-2"}`}
                  style={{ width: PREVIEW_WIDTH, transform: `translateX(calc(-50% + ${preview.shift}px))` } as CSSProperties}
                >
                  {/* Same destination as the marker link; hidden from assistive tech and the tab order to avoid a duplicate. */}
                  <Link
                    href={`/destinations/${point.slug}`}
                    tabIndex={-1}
                    aria-hidden
                    className="block overflow-hidden rounded-md border border-line bg-page text-left shadow-[0_10px_30px_rgba(0,0,0,0.45)] motion-safe:animate-[atlas-in_160ms_ease-out]"
                  >
                    <PreviewPhoto point={point} />
                    <span className="block px-3 pt-2.5 pb-3">
                      <span className="block font-display text-[1.15rem] leading-tight text-fg">{point.name}</span>
                      <span className="mt-0.5 block text-[0.8rem] leading-snug text-fg-muted">{point.region}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-medium text-accent-fg">
                        Open the guide <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    </span>
                  </Link>
                </div>
              )}
            </div>,
            host,
            point.slug,
          );
        })}

      <ol aria-label="Destinations on the map" className="grid gap-x-10 border-t border-line lg:grid-cols-2">
        {points.map((point) => (
          <li key={point.slug} className="flex items-center gap-3 border-b border-line py-3">
            <span
              aria-hidden
              className="grid size-6 shrink-0 place-items-center rounded-full text-[0.66rem] font-semibold text-[#14110d]"
              style={{ backgroundColor: point.accent }}
            >
              {point.number}
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/destinations/${point.slug}`} className="font-medium text-fg underline-offset-4 hover:underline">
                {point.name}
              </Link>
              <p className="text-[0.85rem] leading-snug text-fg-muted">
                {point.category} · {point.region}
              </p>
            </div>
            {status !== "failed" && (
              <button
                type="button"
                onClick={() => locate(point.slug)}
                disabled={status !== "ready"}
                aria-pressed={point.slug === active}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-[0.82rem] text-fg-soft hover:border-fg/50 hover:text-fg disabled:opacity-40 aria-pressed:border-fg/60 aria-pressed:text-fg"
              >
                <Crosshair className="size-3.5" aria-hidden />
                <span>
                  Locate<span className="sr-only"> {point.name}</span> on map
                </span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PreviewPhoto({ point }: { point: AtlasPoint }) {
  const [failed, setFailed] = useState(false);
  if (!point.hero.available || failed) {
    return <span aria-hidden className="block h-[132px]" style={{ background: `linear-gradient(150deg, ${point.accent}55, #16140f)` }} />;
  }
  return (
    <span className="relative block h-[132px]">
      <Image src={point.hero.src} alt="" fill sizes={`${PREVIEW_WIDTH}px`} quality={75} className="object-cover" onError={() => setFailed(true)} />
    </span>
  );
}
