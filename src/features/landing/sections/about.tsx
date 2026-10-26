import { Button, Container, Media, Section, SectionHeader, Stat } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import { aboutStats } from "@/data/landing";
import { cn } from "@/lib/cn";
import { photos } from "@/data/photos";

/** About (Design.md 6.3): copy and photo, then a 4-up stat row. */
export function About() {
  return (
    <Section id="about" flush="top" aria-labelledby="about-title">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="grid justify-items-start gap-5">
            <SectionHeader id="about-title" eyebrow="About us" title="Letting a stranger into your home should feel safe" />
            <p className="text-text-2">
              We started Passionate Taskers for the people who worry most about it: older customers, people living alone, and
              anyone who uses a screen reader. Every page, call and booking is built for them first.
            </p>
            <Button href="/trust">How we check trades</Button>
          </Reveal>
          <Reveal variant="scale">
            <Media alt="smiling older woman in her living room" src={photos.about} ratio="4/5" />
          </Reveal>
        </div>

        <div className="mt-[72px] grid grid-cols-2 gap-y-8 border-t border-line pt-10 md:grid-cols-4">
          {aboutStats.map((s, i) => (
            <Stat
              key={s.label}
              {...s}
              className={cn("px-6", i % 2 === 0 ? "pl-0" : "border-l border-line", i > 0 && "md:border-l md:pl-6", i === 0 && "md:pl-0")}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
