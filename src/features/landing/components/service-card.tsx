import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Media } from "@/components/ui";
import { servicePrice } from "@/data/services";
import type { Service } from "@/types/content";

/*
 * One trade as a card: photo, name, summary, price and registration.
 * The whole card links to booking with the trade already chosen.
 */
export function ServiceCard({ service }: { service: Service }) {
  const price = servicePrice(service);
  return (
    <article className="group relative grid content-start gap-4">
      <div className="overflow-hidden rounded-lg">
        <Media
          alt={service.photoAlt}
          src={service.photo}
          ratio="3/2"
          radius="lg"
          sizes="(min-width: 992px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="transition-transform duration-500 ease-soft group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      </div>
      <h3 className="flex items-center justify-between gap-3 text-h4">
        <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
          {service.name}
        </Link>
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </span>
      </h3>
      <p className="text-base text-text-3">{service.summary}</p>
      <div className="flex flex-wrap gap-2">
        <Badge>{price}</Badge>
        {service.registration && <Badge>{service.registration}</Badge>}
      </div>
    </article>
  );
}

/** The closing card of the grid, for jobs that fit no trade. */
export function OtherJobCard() {
  return (
    <article className="on-dark group relative grid content-between gap-6 rounded-lg bg-ink p-6 text-white">
      <div className="grid gap-3">
        <h3 className="text-h4">
          <Link href="/book" className="after:absolute after:inset-0">
            Not on the list?
          </Link>
        </h3>
        <p className="text-base text-on-ink-2">Tell us what needs doing in your own words, or by voice. We will find the right person.</p>
      </div>
      <span className="inline-flex items-center gap-2 font-medium text-accent">
        Describe your job
        <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" strokeWidth={1.75} />
      </span>
    </article>
  );
}
