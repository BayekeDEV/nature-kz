import type { ReactNode } from "react";

/**
 * A template re-mounts on every route change (unlike a layout), so its CSS
 * entrance animation plays once per page: a short fade and lift. The header
 * and themed background live in the layout and never disappear, so there is
 * no blank or white frame. Search-parameter changes (catalogue filters) keep
 * the same template, so typing does not replay the animation.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
