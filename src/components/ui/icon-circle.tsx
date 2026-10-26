import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** A thin-line Lucide icon in a pale green circle (Design.md section 7). */
export function IconCircle({ icon: Icon, size = "md", className }: { icon: LucideIcon; size?: "sm" | "md"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-accent-100 text-ink",
        size === "md" ? "size-10" : "size-8",
        className,
      )}
    >
      <Icon className={size === "md" ? "size-5" : "size-4"} strokeWidth={1.5} />
    </span>
  );
}
