import { Container, Section, SectionHeader } from "@/components/ui";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { guides } from "@/data/landing";
import { GuideCard } from "../components/guide-card";

/** Guides (Design.md 6.10 "Blog"). */
export function Guides() {
  return (
    <Section id="guides" flush="top" aria-labelledby="guides-title">
      <Container>
        <SectionHeader id="guides-title" align="center" eyebrow="Guides" title="Help for around the home" className="mb-12" />
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <RevealItem key={guide.slug}>
              <GuideCard guide={guide} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
