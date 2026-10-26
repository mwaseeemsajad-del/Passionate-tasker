import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./eyebrow";

/*
 * Intro block for every section: /Eyebrow, H2 and an optional subtitle.
 * Centred in single-column sections, left-aligned in two-column ones.
 * On dark sections pass tone="dark" for the lighter paragraph colour.
 */

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Heading level. Defaults to h2; use h1 only once per page. */
  as?: "h1" | "h2";
  id?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "light",
  as: Heading = "h2",
  id,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "grid max-w-[560px] gap-4",
        align === "center" && "mx-auto justify-items-center text-center",
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading id={id} className="text-h2">
        {title}
      </Heading>
      {subtitle && <p className={tone === "dark" ? "text-on-ink-2" : "text-text-3"}>{subtitle}</p>}
    </div>
  );
}
