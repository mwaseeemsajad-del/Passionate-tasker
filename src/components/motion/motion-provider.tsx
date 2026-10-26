"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Respects the visitor's reduced-motion setting everywhere: movement and
 * scaling are dropped, opacity fades stay (Design.md section 5).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
