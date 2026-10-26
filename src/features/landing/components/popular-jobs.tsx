import Link from "next/link";
import { bookingHref } from "@/data/services";
import { popularJobs } from "@/data/landing";

/** "Popular:" chips under the hero. Each one opens booking with the job already chosen. */
export function PopularJobs() {
  return (
    <nav aria-labelledby="popular-jobs-title" className="flex flex-wrap items-center gap-2">
      <span id="popular-jobs-title" className="mr-1 text-[0.9375rem] font-medium text-on-ink-2">
        Popular jobs:
      </span>
      <ul className="flex flex-wrap gap-2">
        {popularJobs.map((p) => (
          <li key={p.job}>
            <Link
              href={bookingHref(p.trade, p.job)}
              className="inline-flex min-h-11 items-center rounded-full border border-white/30 bg-white/10 px-4 text-[0.9375rem] font-medium backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
            >
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
