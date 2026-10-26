import { Container, Section, SectionHeader } from "@/components/ui";
import { services } from "@/data/services";
import { OtherJobCard, ServiceCard } from "@/features/landing/components/service-card";
import type { Trade } from "@/types/content";

/** The other trades, so a visitor on the wrong page is one click from the right one. */
export function OtherServices({ current }: { current?: Trade }) {
  const others = services.filter((s) => s.slug !== current);
  return (
    <Section id="other-services" aria-labelledby="other-services-title">
      <Container className="grid gap-10">
        <SectionHeader id="other-services-title" eyebrow="Our services" title={current ? "Other trades we cover" : "Every trade your home needs"} />
        <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {others.map((service) => (
            <li key={service.slug} className="grid">
              <ServiceCard service={service} />
            </li>
          ))}
          <li className="grid">
            <OtherJobCard />
          </li>
        </ul>
      </Container>
    </Section>
  );
}
