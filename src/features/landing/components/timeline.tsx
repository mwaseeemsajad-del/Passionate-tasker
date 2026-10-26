"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useRef, type ReactNode } from "react";

/*
 * Vertical timeline whose green line fills as you scroll (Design.md 6.5).
 * The step cards are passed in as children and stay server-rendered.
 */
export function Timeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });

  return (
    <div ref={ref} className="relative grid gap-6 pl-11">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-ink-line" />
      <motion.span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[7px] w-0.5 origin-top bg-accent"
        style={{ scaleY: reduce ? 1 : scrollYProgress }}
      />
      <span aria-hidden="true" className="absolute top-0 left-0 size-4 rounded-full bg-accent shadow-[0_0_0_5px_rgb(2_205_49/0.18)]" />
      {children}
    </div>
  );
}
