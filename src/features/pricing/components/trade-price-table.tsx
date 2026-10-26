import Link from "next/link";
import { bookingHref, formatFromPrice, servicePrice } from "@/data/services";
import type { Service } from "@/types/content";

/*
 * One trade's jobs and starting prices, as a real table so a screen reader
 * can move by row and column. Each job name opens booking with it chosen.
 */
export function TradePriceTable({ service }: { service: Service }) {
  const captionId = `prices-${service.slug}`;
  return (
    <section aria-labelledby={captionId} className="grid gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={captionId} className="text-h3">
          <Link href={`/services/${service.slug}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            {service.name}
          </Link>
        </h2>
        <p className="text-[0.9375rem] text-text-3">
          {servicePrice(service)}
          {service.registration ? ` · ${service.registration}` : ""}
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full border-collapse text-left text-base">
          <caption className="sr-only">{service.name}: jobs and indicative starting prices</caption>
          <thead className="bg-accent-50">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Job
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Starting price
              </th>
            </tr>
          </thead>
          <tbody>
            {service.jobs.map((job) => (
              <tr key={job.slug} className="border-t border-line">
                <th scope="row" className="px-5 py-1.5 font-normal">
                  <Link href={bookingHref(service.slug, job.slug)} className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">
                    {job.name}
                  </Link>
                </th>
                <td className="px-5 py-4 text-right whitespace-nowrap tabular-nums">{formatFromPrice(job)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
