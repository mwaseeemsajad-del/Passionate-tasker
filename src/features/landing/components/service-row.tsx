import { Badge, Button, Media } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Service } from "@/types/content";

/*
 * One service: copy and tags on one side, a wide photo on the other.
 * `reverse` swaps the sides on desktop so rows alternate (Design.md 6.6).
 * Takes a Service, so service and category pages can reuse it unchanged.
 */
export function ServiceRow({ service, reverse = false }: { service: Service; reverse?: boolean }) {
  const price = `From £${service.fromPrice}${service.priceUnit === "hour" ? " an hour" : ""}`;
  return (
    <article className="grid items-center gap-6 md:grid-cols-[1fr_1.3fr] md:gap-12">
      <div className={cn("grid justify-items-start gap-5", reverse && "md:order-2")}>
        <h3 className="text-h3">{service.name}</h3>
        <p className="text-text-3">{service.summary}</p>
        <div className="flex flex-wrap gap-2">
          <Badge>{price}</Badge>
          <Badge>{service.registration ?? service.highlight}</Badge>
        </div>
        <Button href={`/book?trade=${service.slug}`}>
          Book now<span className="sr-only">: {service.name}</span>
        </Button>
      </div>
      <Media alt={service.photoAlt} src={service.photo} ratio="16/9" radius="lg" />
    </article>
  );
}
