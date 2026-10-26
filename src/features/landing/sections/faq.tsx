import { Accordion, Container, Section, SectionHeader } from "@/components/ui";
import { faqs } from "@/data/landing";

/** FAQ (Design.md 6.12). */
export function Faq() {
  return (
    <Section id="faq" flush="bottom" aria-labelledby="faq-title">
      <Container>
        <SectionHeader id="faq-title" align="center" eyebrow="FAQ" title="Questions people ask before booking" className="mb-12" />
        <Accordion items={faqs} className="mx-auto max-w-[760px]" />
      </Container>
    </Section>
  );
}
