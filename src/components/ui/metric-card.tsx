import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/*
 * A dashboard tile: an icon, a big number and what it counts. With `href`
 * the whole tile is a link to the list behind the number. `tone="alert"`
 * marks a number that needs the person's attention.
 */
type MetricCardProps = { icon: LucideIcon; label: string; value: number | string; hint?: string; href?: string; tone?: "plain" | "alert" };

export function MetricCard({ icon: Icon, label, value, hint, href, tone = "plain" }: MetricCardProps) {
  const alert = tone === "alert";
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span aria-hidden="true" className={cn("grid size-10 place-items-center rounded-full", alert ? "bg-ink text-accent" : "bg-accent-100 text-ink")}>
          <Icon className="size-5" strokeWidth={1.5} />
        </span>
        {href && <ArrowRight aria-hidden="true" className="size-5 text-text-3 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" strokeWidth={1.5} />}
      </div>
      <span className="text-stat leading-none font-semibold tabular-nums">{value}</span>
      <span className="grid gap-0.5">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-[0.9375rem] text-text-3">{hint}</span>}
      </span>
    </>
  );
  const cls = cn("group grid content-start gap-4 rounded-lg border p-5", alert ? "border-ink bg-accent-50" : "border-line bg-white");
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-ink")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
