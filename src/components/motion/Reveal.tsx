"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
}

/**
 * Fades a block in as it scrolls into view.
 * Content is visible by default (server HTML, no JS, reduced motion); it is
 * only hidden after mount if it starts below the fold, so a failed script can
 * never leave the page blank.
 */
export function Reveal({ children, className = "", as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "pending" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={className} data-reveal={state === "idle" ? undefined : state}>
      {children}
    </Tag>
  );
}
