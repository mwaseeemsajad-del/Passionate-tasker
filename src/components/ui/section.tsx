import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/*
 * Every page section goes through this (Design.md section 1 rules).
 *
 * tone="light": paper background.
 * tone="dark":  an ink slab with large rounded corners that floats off the
 *               page edge. Adds `on-dark`, which switches focus rings to green.
 * density="dense": tighter vertical padding (logos strip, How it works).
 * flush="top" | "bottom" | "both": drop the padding on that side, for sections
 *               that follow one another without a gap.
 */

type Tone = "light" | "dark";
type Density = "normal" | "dense";
type Flush = "none" | "top" | "bottom" | "both";

const padding: Record<Density, { top: string; bottom: string }> = {
  normal: { top: "pt-14 sm:pt-[72px] md:pt-24 lg:pt-[124px]", bottom: "pb-14 sm:pb-[72px] md:pb-24 lg:pb-[124px]" },
  dense: { top: "pt-12 sm:pt-14 md:pt-[72px] lg:pt-20", bottom: "pb-12 sm:pb-14 md:pb-[72px] lg:pb-20" },
};

export type SectionProps = ComponentProps<"section"> & {
  tone?: Tone;
  density?: Density;
  flush?: Flush;
};

export function Section({ tone = "light", density = "normal", flush = "none", className, ...props }: SectionProps) {
  const p = padding[density];
  return (
    <section
      className={cn(
        flush !== "top" && flush !== "both" && p.top,
        flush !== "bottom" && flush !== "both" && p.bottom,
        tone === "dark" &&
          "on-dark mx-2 rounded-[1.5rem] bg-ink text-white sm:mx-3 sm:rounded-[2rem] md:rounded-[2.5rem] lg:rounded-section",
        className,
      )}
      {...props}
    />
  );
}
