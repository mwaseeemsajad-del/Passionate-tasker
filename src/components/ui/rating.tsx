import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Five stars and a review count, e.g. "4.9 from 2,180 reviews". */
export function Rating({ score, count, tone = "light", className }: { score: number; count: number; tone?: "light" | "dark"; className?: string }) {
  const label = `${score} out of 5 from ${count.toLocaleString("en-GB")} reviews`;
  return (
    <div className={cn("flex items-center gap-2.5 text-[0.9375rem]", className)} aria-label={label} role="img">
      <span className="flex gap-0.5 text-accent" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4" fill="currentColor" strokeWidth={0} />
        ))}
      </span>
      <span aria-hidden="true" className={tone === "dark" ? "text-on-ink-2" : "text-text-3"}>
        {score} from {count.toLocaleString("en-GB")} reviews
      </span>
    </div>
  );
}
