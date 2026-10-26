import { Button, Container, Media, Section, SectionHeader } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { reasons } from "@/data/landing";
import { photos } from "@/data/photos";
import { FeatureCard } from "../components/feature-card";

/** Why choose us (Design.md 6.4): mirrored two-column, three staggered feature cards. */
export function WhyChoose() {
  return (
    <Section flush="top" aria-labelledby="why-title">
      <Container className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="grid justify-items-start gap-5">
          <SectionHeader
            id="why-title"
            eyebrow="Why choose us"
            title="Three things you won't get from a card through the door"
            subtitle="Anyone can print a flyer. We check every tradesperson ourselves and stand behind the work."
          />
          <RevealGroup className="grid w-full gap-4">
            {reasons.map((reason, i) => (
              <RevealItem key={reason.title}>
                <FeatureCard feature={reason} tinted={i === 1} />
              </RevealItem>
            ))}
          </RevealGroup>
          <Button href="/book" className="mt-2">
            Book a checked trade
          </Button>
        </div>
        <Reveal variant="scale">
          <Media alt="electrician in a hard hat wiring a socket" src={photos.whyChoose} ratio="3/4" />
        </Reveal>
      </Container>
    </Section>
  );
}
