import Image from "next/image";
import { Button } from "@/components/ui";
import type { RecentJob } from "@/types/content";

/** A big image card with its title and action over a dark bottom gradient. */
export function JobCard({ job }: { job: RecentJob }) {
  return (
    <article className="relative flex aspect-[4/5] snap-start items-end overflow-hidden rounded-xl bg-linear-to-br from-moss to-moss-deep md:aspect-video">
      {job.photo ? (
        <Image src={job.photo} alt={job.photoAlt} fill sizes="(min-width: 768px) 1000px, 88vw" className="object-cover" />
      ) : (
        <span className="absolute top-5 left-6 text-sm text-on-ink-3">Photo: {job.photoAlt}</span>
      )}
      <div className="hc-shade relative flex w-full flex-wrap items-end justify-between gap-x-8 gap-y-4 bg-linear-to-t from-black/75 to-transparent p-6 sm:p-8">
        <h3 className="max-w-[14ch] text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.15]">{job.title}</h3>
        <div className="grid max-w-[320px] justify-items-start gap-3.5">
          <p className="text-base text-on-ink-2">{job.summary}</p>
          <Button href={`/book?trade=${job.trade}`} variant="secondary">
            Book this job<span className="sr-only">: {job.title}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
