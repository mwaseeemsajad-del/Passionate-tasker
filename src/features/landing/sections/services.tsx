import { Container, Section, SectionHeader } from "@/components/ui";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { PRICE_NOTE, services } from "@/data/services";
import { OtherJobCard, ServiceCard } from "../components/service-card";

/*
 * Services (Design.md 6.6, laid out as a card grid as section 11 allows,
 * because there are seven trades). Eight cells: the trades plus "Not on the list".
 */
export function Services() {
  return (
    <Section id="services" aria-labelledby="services-title">
      <Container>
        <SectionHeader
          id="services-title"
          align="center"
          eyebrow="Our services"
          title="Every trade your home needs"
          subtitle="Gas and electrical work is only done by people on the right register: Gas Safe for gas, NICEIC or NAPIT for electrics."
          className="mb-12 lg:mb-14"
        />
        <RevealGroup className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <RevealItem key={service.slug} className="grid">
              <ServiceCard service={service} />
            </RevealItem>
          ))}
          <RevealItem className="grid">
            <OtherJobCard />
          </RevealItem>
        </RevealGroup>
        <p className="mt-10 text-center text-sm text-text-3">{PRICE_NOTE}</p>
      </Container>
    </Section>
  );
}
