import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { bookingHref, formatFromPrice } from "@/data/services";
import type { ServiceJob, Trade } from "@/types/content";

/*
 * One job a trade does, as a large link straight into booking with the trade
 * and the job already chosen. The whole card is the target, so it is easy to
 * hit with a shaky hand or at high zoom.
 */
export function ServiceJobCard({ trade, job }: { trade: Trade; job: ServiceJob }) {
  return (
    <li className="group relative flex min-h-20 items-center justify-between gap-4 rounded-lg border border-line bg-white p-5 transition-colors hover:border-ink">
      <div className="grid gap-1">
        <h3 className="text-h4">
          <Link href={bookingHref(trade, job.slug)} className="after:absolute after:inset-0 after:rounded-lg">
            {job.name}
          </Link>
        </h3>
        <p className="text-base text-text-3">{formatFromPrice(job)}</p>
      </div>
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
      >
        <ArrowRight className="size-5" strokeWidth={1.5} />
      </span>
    </li>
  );
}
