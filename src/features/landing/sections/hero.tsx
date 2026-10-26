import Image from "next/image";
import Link from "next/link";
import { Mic } from "lucide-react";
import { Avatar, Button, Container, Rating } from "@/components/ui";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/data/site";
import { heroRating, heroStat } from "@/data/landing";
import { photos } from "@/data/photos";

const crew = ["Daniel Okafor", "Amira Khan", "Rob Miller", "Jas Singh"];

/*
 * Full-bleed hero (Design.md 6.1). The photo is decorative (the headline
 * carries the meaning), so it has empty alt text. The overlay is darkest on
 * the left, behind the text, to keep white text readable on any photo.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative overflow-hidden rounded-b-[1.5rem] bg-moss-deep text-white sm:rounded-b-[2rem] lg:rounded-b-section">
      <Image src={photos.hero} alt="" fill priority sizes="100vw" className="object-cover object-[70%_center]" />
      <div aria-hidden="true" className="hc-shade absolute inset-0 bg-linear-to-r from-ink/90 via-ink/65 to-ink/20" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-ink/40 lg:hidden" />

      <Container className="relative grid items-end gap-10 pt-[150px] pb-[72px] lg:grid-cols-[1.25fr_1fr] lg:pt-[180px]">
        <Reveal className="grid max-w-[620px] gap-6">
          <h1 id="hero-title" className="text-display">
            {site.tagline}
          </h1>
          <p className="max-w-[46ch] text-on-ink-2">
            Plumbers, electricians, gas engineers, painters and more across {site.area}. Every one is ID checked, DBS checked and insured before
            they reach your door.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-4">
            <Button href="/book" variant="secondary">
              Get a fixed price
            </Button>
            <Link
              href="/book?voice=1"
              className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/40 px-5 font-medium transition-colors hover:border-accent hover:text-accent"
            >
              <Mic aria-hidden="true" className="size-5" strokeWidth={1.75} />
              Book by voice
            </Link>
          </div>
          <Rating score={heroRating.score} count={heroRating.count} tone="dark" />
        </Reveal>

        <Reveal variant="fade" className="w-full lg:max-w-[340px] lg:justify-self-end">
          <aside
            aria-label="Jobs finished"
            className="grid gap-3.5 rounded-xl border border-white/25 bg-white/12 p-6 backdrop-blur-md"
          >
            <span className="text-5xl leading-none font-semibold tabular-nums">
              <CountUp to={heroStat.value ?? 0} suffix={heroStat.suffix} />
            </span>
            <p className="text-[0.9375rem] text-on-ink-2">{heroStat.label}</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {crew.map((name) => (
                  <Avatar key={name} name={name} size="sm" className="ring-2 ring-moss" />
                ))}
              </div>
              <Link href="#how-it-works" className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink">
                Meet the trades
              </Link>
            </div>
          </aside>
        </Reveal>
      </Container>
    </section>
  );
}
