import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";

/** A list with outlined circle-check icons. Icons turn green on dark surfaces. */
export function CheckList({ items, tone = "light", className }: { items: string[]; tone?: "light" | "dark"; className?: string }) {
  return (
    <ul className={cn("grid gap-3 text-base", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <CircleCheck
            aria-hidden="true"
            className={cn("mt-0.5 size-5 shrink-0", tone === "dark" ? "text-accent" : "text-ink")}
            strokeWidth={1.5}
          />
          <span className={tone === "dark" ? "text-on-ink-2" : undefined}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
