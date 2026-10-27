"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Shared motion defaults: honour the OS "reduce motion" setting everywhere. */
export function MotionPreferences({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}
