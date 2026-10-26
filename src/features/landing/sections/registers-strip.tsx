import { Container, Section } from "@/components/ui";
import { registers } from "@/data/landing";

/*
 * The "trusted by" strip (Design.md 6.2), used for the public registers we
 * check tradespeople against. A list for screen readers, a looping marquee on
 * screen. The marquee stops for reduced motion and pauses on hover.
 */
export function RegistersStrip() {
  return (
    <Section density="dense" aria-labelledby="registers-title">
      <Container>
        <p id="registers-title" className="mb-7 text-center text-base text-text-3">
          Every tradesperson is checked against these registers before they are listed
        </p>
      </Container>
      <ul className="sr-only">
        {registers.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="group overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...registers, ...registers].map((r, i) => (
            <span key={i} className="rounded-full bg-accent-50 px-7 py-3.5 text-[1.0625rem] font-semibold whitespace-nowrap text-text-2">
              {r}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
