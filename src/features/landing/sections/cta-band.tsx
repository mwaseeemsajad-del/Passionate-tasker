import { Button, CheckList, Container, Media, Section } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import { ctaChecklist } from "@/data/landing";
import { photos } from "@/data/photos";

/** Closing call to action (Design.md 6.11). */
export function CtaBand() {
  return (
    <Section id="get-started" tone="dark" aria-labelledby="cta-title">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="grid justify-items-start gap-5">
          <h2 id="cta-title" className="text-h2">
            Got a job that’s been waiting? Get a price in a minute.
          </h2>
          <p className="text-on-ink-2">Nothing to pay until the work is done and you’re happy with it.</p>
          <Button href="/book" variant="secondary">
            Get a fixed price
          </Button>
          <CheckList items={ctaChecklist} tone="dark" className="mt-2" />
        </Reveal>
        <Reveal variant="scale">
          <Media alt="tradesperson's van with the side door open, full of tools" src={photos.cta} ratio="5/4" tone="dark" />
        </Reveal>
      </Container>
    </Section>
  );
}
