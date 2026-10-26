import { Hammer, Mic, PhoneCall, UserRoundCheck } from "lucide-react";
import { Card, Container, IconCircle, Section, SectionHeader } from "@/components/ui";
import { site } from "@/data/site";
import type { Service } from "@/types/content";

/*
 * How booking this trade works today, in the honest words of the concierge
 * MVP: a person calls to confirm and arranges who comes. Change this when
 * matching and online payment arrive (milestones 07 and 08).
 */
export function ServiceSteps({ service }: { service: Service }) {
  const steps = [
    { icon: Mic, title: "Tell us the job", body: "Choose a job above, fill in the short form, or press Book by voice and answer one question at a time." },
    { icon: PhoneCall, title: "We call you", body: `A real person calls to go through the job and agree the price. Prefer to call us? ${site.phone.display}.` },
    { icon: UserRoundCheck, title: "We tell you who is coming", body: `We arrange ${service.person} who has passed our checks, and tell you their name before they arrive.` },
    { icon: Hammer, title: "Pay when it is done", body: "Nothing to pay online. Any extra work needs your yes first." },
  ];
  return (
    <Section id="how-it-works" aria-labelledby="steps-title" tone="dark" density="dense">
      <Container className="grid gap-10">
        <SectionHeader id="steps-title" eyebrow="How it works" title="Four steps, one phone call" tone="dark" />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="grid">
              <Card variant="dark" className="grid content-start gap-3">
                <IconCircle icon={step.icon} />
                <h3 className="text-h4">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="text-base text-on-ink-2">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
