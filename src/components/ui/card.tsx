import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/*
 * The one card shell. Flat, hairline border, no heavy shadows (Design.md 2.5).
 * - plain: white card with a line border.
 * - tint:  pale green fill (testimonials, pricing).
 * - dark:  for cards on ink sections (How it works steps).
 * - featured: the ink card that stands out in a row of tint cards.
 */
type CardVariant = "plain" | "tint" | "dark" | "featured";

const variants: Record<CardVariant, string> = {
  plain: "border border-line bg-white",
  tint: "border border-line bg-accent-50",
  dark: "border border-ink-line bg-ink-surface text-white",
  featured: "on-dark border border-ink bg-ink text-white",
};

export type CardProps = ComponentProps<"div"> & {
  variant?: CardVariant;
  radius?: "lg" | "xl";
  padding?: "md" | "lg";
};

export function Card({ variant = "plain", radius = "lg", padding = "md", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        radius === "lg" ? "rounded-lg" : "rounded-xl",
        padding === "md" ? "p-6" : "p-7",
        className,
      )}
      {...props}
    />
  );
}
