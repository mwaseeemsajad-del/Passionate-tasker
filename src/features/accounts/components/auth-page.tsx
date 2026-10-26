import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Container, Eyebrow } from "@/components/ui";

/** Shell for login and sign-up: one narrow column, one h1, short lede, then the form. */
export function AuthPage({ eyebrow, title, lede, children, aside }: { eyebrow: string; title: string; lede: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <>
      <Navbar variant="solid" />
      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="grid items-start gap-12 pt-8 pb-16 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-20 lg:pt-12">
          <div className="grid gap-8">
            <header className="grid gap-4">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h1 className="text-display">{title}</h1>
              <p className="text-text-2">{lede}</p>
            </header>
            {children}
          </div>
          {aside && <aside className="lg:pt-24">{aside}</aside>}
        </Container>
      </main>
    </>
  );
}
