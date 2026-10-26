import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Container, Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";

/*
 * Shell for the information pages (accessibility, trust, how it works): a
 * solid header, one h1, a short lede, then sections in a readable column.
 */
export function InfoPage({ eyebrow, title, lede, updated, children }: { eyebrow: string; title: string; lede: ReactNode; updated?: string; children: ReactNode }) {
  return (
    <>
      <Navbar variant="solid" />
      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="grid gap-14 pt-8 lg:pt-12">
          <header className="grid max-w-[720px] gap-5">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="text-display">{title}</h1>
            <p className="text-text-2">{lede}</p>
            {updated && <p className="text-[0.9375rem] text-text-3">Last updated {updated}</p>}
          </header>
          <div className="grid max-w-[760px] gap-14">{children}</div>
        </Container>
      </main>
    </>
  );
}

/** A titled part of an information page. */
export function InfoSection({ id, title, children, className }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn("grid gap-5", className)}>
      <h2 id={id} className="text-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Running text with comfortable spacing; links are underlined. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 text-text-2 [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4">{children}</div>;
}

/** A list of titled points, each separated by a hairline. */
export function PointList({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <ul className="grid divide-y divide-line border-y border-line">
      {items.map((item) => (
        <li key={item.title} className="grid gap-1.5 py-5">
          <h3 className="text-h4">{item.title}</h3>
          <div className="text-text-2 [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4">{item.body}</div>
        </li>
      ))}
    </ul>
  );
}
