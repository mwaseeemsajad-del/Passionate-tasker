import { Button, Card, Container, Section, SectionHeader } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import { steps } from "@/data/landing";
import { Timeline } from "../components/timeline";

/** How it works (Design.md 6.5): dark slab, sticky intro on the left, scroll-filled timeline on the right. */
export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="dark" density="dense" aria-labelledby="how-title">
      <Container className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="grid justify-items-start gap-5 lg:sticky lg:top-[120px]">
          <SectionHeader
            id="how-title"
            tone="dark"
            eyebrow="How it works"
            title="From “something's broken” to fixed, in four steps"
            subtitle="Book by typing, tapping or talking. Booking takes about two minutes, then we call you to confirm."
          />
          <Button href="/book" variant="secondary">
            Start a booking
          </Button>
        </div>

        <Timeline>
          <ol className="grid gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.title} as="li">
                <Card variant="dark" padding="lg" className="grid gap-3">
                  <step.icon aria-hidden="true" className="size-5 text-accent" strokeWidth={1.5} />
                  <h3 className="text-h3">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="text-on-ink-2">{step.body}</p>
                  <small className="text-sm text-on-ink-3">{step.timing}</small>
                </Card>
              </Reveal>
            ))}
          </ol>
        </Timeline>
      </Container>
    </Section>
  );
}
