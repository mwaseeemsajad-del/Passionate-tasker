import { Mic, TriangleAlert } from "lucide-react";
import { Badge, Button, Container, Eyebrow, Media } from "@/components/ui";
import { bookingHref, servicePrice } from "@/data/services";
import type { Service } from "@/types/content";

/*
 * Top of a trade page: the one h1, what the trade covers, its price and
 * register, and two ways to book. A trade with a safety notice (gas) shows it
 * here, before anything else can be pressed.
 */
export function ServiceHero({ service }: { service: Service }) {
  return (
    <Container className="grid items-center gap-10 pt-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:pt-12">
      <header className="grid justify-items-start gap-5">
        <Eyebrow>Our services</Eyebrow>
        <h1 className="text-display">{service.name}</h1>
        <p className="text-text-2">{service.summary}</p>
        <div className="flex flex-wrap gap-2">
          <Badge>{servicePrice(service)}</Badge>
          {service.registration && <Badge>{service.registration}</Badge>}
          <Badge>{service.highlight}</Badge>
        </div>
        {service.notice && (
          <p role="note" className="flex gap-3 rounded-lg border-2 border-danger p-5 font-semibold">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-danger" strokeWidth={2} />
            {service.notice}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button href={bookingHref(service.slug)}>Book {service.person}</Button>
          <Button href={bookingHref(service.slug)} variant="outline">
            <span className="inline-flex items-center gap-2">
              <Mic aria-hidden="true" className="size-4" strokeWidth={1.5} />
              Book by voice
            </span>
          </Button>
        </div>
      </header>
      <Media alt={service.photoAlt} src={service.photo} ratio="3/2" radius="xl" priority sizes="(min-width: 992px) 50vw, 100vw" />
    </Container>
  );
}
