import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Small pills.
 * - white: the "Most popular" badge on a dark card.
 * - tint:  price and detail tags ("From £65", "Gas Safe registered").
 */
type BadgeProps = { tone?: "white" | "tint"; children: ReactNode; className?: string };

export function Badge({ tone = "tint", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        tone === "white" && "bg-white px-3 py-1 text-[0.8125rem] text-text-2",
        tone === "tint" && "border border-accent-stroke bg-accent-50 px-3 py-1.5 text-sm text-text-2",
        className,
      )}
    >
      {children}
    </span>
  );
}
