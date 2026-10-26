import { Container, Media, Section, SectionHeader } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import { reviews } from "@/data/landing";
import { photos } from "@/data/photos";
import { ReviewCard } from "../components/review-card";

/** Testimonials (Design.md 6.9): three staggered columns mixing quotes and photos. */
export function Testimonials() {
  const [a, b, c, d] = reviews;
  return (
    <Section aria-labelledby="reviews-title">
      <Container>
        <SectionHeader id="reviews-title" align="center" eyebrow="Testimonials" title="What customers say after the job" className="mb-12 lg:mb-14" />
        <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-6">
            <Reveal><ReviewCard review={a} /></Reveal>
            <Reveal variant="scale"><Media alt="older woman at her kitchen table" src={photos.reviewCustomer} ratio="4/5" radius="lg" sizes="(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw" /></Reveal>
          </div>
          <div className="grid gap-6 md:mt-12">
            <Reveal variant="scale"><Media alt="man booking a job on his phone at home" src={photos.reviewPhone} ratio="4/5" radius="lg" sizes="(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw" /></Reveal>
            <Reveal><ReviewCard review={b} /></Reveal>
          </div>
          <div className="grid gap-6 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
            <Reveal><ReviewCard review={c} /></Reveal>
            <Reveal><ReviewCard review={d} /></Reveal>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-text-3">Sample reviews written for the prototype.</p>
      </Container>
    </Section>
  );
}
