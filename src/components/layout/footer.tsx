import Link from "next/link";
import { Container } from "@/components/ui";
import { footerNav, site } from "@/data/site";
import { Logo } from "./logo";

export function Footer() {
  // Fixed on purpose: reading the clock here would stop the page being static.
  const year = 2026;
  return (
    <footer className="on-dark mt-14 bg-ink text-on-ink-2 sm:mt-[72px] md:mt-24 lg:mt-[124px]">
      <Container>
        <div className="grid grid-cols-2 gap-10 pt-[72px] pb-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 grid content-start gap-4 text-base text-on-ink-3 md:col-span-1">
            <Logo tone="dark" />
            <p>Checked local tradespeople for homes across {site.area}.</p>
            <p>
              <a href={site.phone.href} className="text-white underline underline-offset-4">
                {site.phone.display}
              </a>
              <br />
              {site.supportHours}
            </p>
          </div>
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="mb-4 text-base text-white">{group.title}</h2>
              <ul className="grid gap-2.5 text-base">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="inline-flex min-h-6 items-center text-on-ink-3 transition-colors duration-200 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-ink-line py-6 text-sm text-on-ink-3">
          <span>
            © {year} {site.name}
          </span>
          <span>Prototype: content and figures are samples</span>
        </div>
      </Container>
    </footer>
  );
}
