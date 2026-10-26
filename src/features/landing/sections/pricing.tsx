import { Container, Section, SectionHeader } from "@/components/ui";
import { plans } from "@/data/pricing";
import { PricingPlans } from "../components/pricing-plans";

/** Pricing (Design.md 6.7). */
export function Pricing() {
  return (
    <Section id="pricing" flush="top" aria-labelledby="pricing-title">
      <Container>
        <SectionHeader
          id="pricing-title"
          align="center"
          eyebrow="Pricing plan"
          title="Pay per job, or cover your home for the year"
          subtitle="Sample prices for the prototype."
          className="mb-10"
        />
        <PricingPlans plans={plans} />
      </Container>
    </Section>
  );
}
