"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { knownSavedIds } from "@/lib/saved-store";
import { useSavedDestinations } from "@/lib/use-saved-destinations";

export const NAV_ITEMS = [
  { href: "/destinations", label: "Discover" },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
] as const;

interface Props {
  /** Slugs of guide pages, whose photographic hero sits under the header. */
  guideSlugs: string[];
  /** Ids of current destinations, so stale saved ids are not counted. */
  destinationIds: string[];
}

function hasPhotoHero(pathname: string, guideSlugs: string[]) {
  if (pathname === "/") return true;
  const match = pathname.match(/^\/destinations\/([^/]+)\/?$/);
  return match ? guideSlugs.includes(match[1]) : false;
}

export function SiteHeader({ guideSlugs, destinationIds }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { ids, hydrated } = useSavedDestinations();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const overlay = hasPhotoHero(pathname, guideSlugs) && !scrolled && !menuOpen;
  const savedCount = hydrated ? knownSavedIds(ids, destinationIds).length : 0;

  // Only update state when crossing the threshold, not on every scroll frame.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Mobile menu behaves as a modal: focus trap, Escape to close, no page scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [toggleRef.current, ...panel.querySelectorAll<HTMLElement>("a[href], button")].filter(
        (el): el is HTMLElement => el !== null,
      );
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

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const linkTone = overlay ? "text-white" : "text-fg";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
          overlay ? "on-photo bg-transparent" : "bg-page/90 shadow-[0_1px_0_var(--t-border)] backdrop-blur-md"
        }`}
      >
        <div className="page-container relative flex h-[var(--header-height)] items-center justify-between gap-6">
          <Link href="/" className={`font-display text-[1.45rem] font-semibold tracking-[0.12em] ${linkTone}`}>
            NATURE KZ
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative py-2 text-[0.95rem] font-medium ${linkTone} after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/saved"
              aria-label={savedCount > 0 ? `Saved destinations (${savedCount})` : "Saved destinations"}
              aria-current={pathname === "/saved" ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.95rem] font-medium ${linkTone} hover:bg-current/10`}
            >
              <Bookmark className="size-[1.1rem]" strokeWidth={1.7} aria-hidden fill={savedCount > 0 ? "currentColor" : "none"} />
              <span className="hidden sm:inline">Saved</span>
              {savedCount > 0 && (
                <span aria-hidden className="min-w-5 rounded-full bg-current/15 px-1.5 text-center text-xs tabular-nums leading-5">
                  {savedCount}
                </span>
              )}
            </Link>

            <button
              ref={toggleRef}
              type="button"
              className={`grid size-11 place-items-center rounded-full md:hidden ${linkTone}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => (menuOpen ? closeMenu(false) : setMenuOpen(true))}
            >
              {menuOpen ? <X className="size-6" strokeWidth={1.5} aria-hidden /> : <Menu className="size-6" strokeWidth={1.5} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become the containing block. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[var(--header-height)] bottom-0 z-50 overflow-y-auto bg-page md:hidden"
          >
            <nav aria-label="Mobile" className="page-container flex flex-col pt-6 pb-10">
              {[{ href: "/", label: "Home" }, ...NAV_ITEMS, { href: "/saved", label: "Saved destinations" }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => closeMenu(false)}
                  className="font-display border-b border-line py-4 text-[2rem] leading-tight text-fg aria-[current=page]:text-accent-fg"
                >
                  {item.label}
                </Link>
              ))}
              <p className="mt-8 max-w-sm text-[0.95rem] text-fg-muted">Discover Kazakhstan, beyond the familiar.</p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
