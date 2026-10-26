import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/data/site";

/** Placeholder mark and wordmark until the real logo is designed. tone="dark" = for dark backgrounds. */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 text-[1.1875rem] font-semibold", tone === "dark" ? "text-white" : "text-ink", className)}>
      <span aria-hidden="true" className="grid size-[34px] place-items-center rounded-[10px] bg-accent text-sm font-bold text-ink">
        {site.shortName}
      </span>
      {site.name}
    </Link>
  );
}
