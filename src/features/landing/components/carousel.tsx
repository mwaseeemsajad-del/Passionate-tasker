"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

/*
 * Horizontal slider of wide cards with the next one peeking in (Design.md 6.8).
 * Native scroll-snap does the work, so touch, trackpad and keyboard scrolling
 * all behave normally; the arrows just scroll one card at a time.
 */
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const go = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "grid size-12 cursor-pointer place-items-center rounded-full border border-ink-line bg-ink-surface text-white transition-colors hover:border-accent hover:text-accent";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        tabIndex={0}
        className="grid snap-x snap-mandatory auto-cols-[min(88%,1000px)] grid-flow-col gap-6 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <button type="button" className={arrow} onClick={() => go(-1)} aria-label="Previous">
          <ArrowLeft className="size-5" strokeWidth={1.6} aria-hidden="true" />
        </button>
        <button type="button" className={arrow} onClick={() => go(1)} aria-label="Next">
          <ArrowRight className="size-5" strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
