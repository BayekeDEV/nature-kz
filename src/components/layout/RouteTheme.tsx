"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { themeForPath, themeVars } from "@/lib/theme";
import type { DestinationTheme } from "@/lib/types";

interface Props {
  /** Guide themes keyed by slug; any other path uses the brand theme. */
  themes: Record<string, DestinationTheme>;
  children: ReactNode;
}

/**
 * Applies the current route's colour theme to the whole shell (header, page and
 * footer). Because it wraps the layout rather than each page, the background
 * changes smoothly between themed pages instead of flashing.
 */
export function RouteTheme({ themes, children }: Props) {
  const pathname = usePathname();
  const theme = themeForPath(pathname, themes);

  // Keep the browser's overscroll area and UI colour in step with the page.
  useEffect(() => {
    document.documentElement.style.backgroundColor = theme.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.bg);
  }, [theme.bg]);

  return (
    <div
      style={themeVars(theme)}
      className="flex min-h-svh flex-col bg-page text-fg transition-[background-color,color] duration-500 ease-[var(--ease-soft)]"
    >
      {children}
    </div>
  );
}
