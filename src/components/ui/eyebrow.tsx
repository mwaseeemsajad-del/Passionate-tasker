import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The "/Label" eyebrow that sits above every section title (Design.md 2.2). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-[0.9375rem] leading-[1.4]", className)}>
      <span aria-hidden="true">/</span>
      {children}
    </span>
  );
}
