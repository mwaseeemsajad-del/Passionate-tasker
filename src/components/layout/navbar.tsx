import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { mainNav, primaryCta } from "@/data/site";
import { cn } from "@/lib/cn";
import { DisplayMenu } from "./display-settings";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

/*
 * Floating white pill navigation (Design.md section 3).
 * - overlay: sits on top of a dark hero, which must start underneath it.
 * - solid:   for pages that open on white; takes up its own space.
 * The Display settings sit next to it on every page and every screen size.
 */
export function Navbar({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const overlay = variant === "overlay";
  return (
    <header className={cn("z-20 pt-4", overlay ? "absolute inset-x-0 top-0" : "relative pb-4")}>
      <Container className="flex flex-wrap items-center justify-between gap-3">
        <Logo tone={overlay ? "dark" : "light"} />
        <div className="flex items-center gap-2">
          <DisplayMenu bordered={!overlay} />
          <nav
            aria-label="Main"
            className={cn("hidden items-center gap-7 rounded-full bg-white py-1 pr-1 pl-7 xl:flex", !overlay && "border border-line")}
          >
            {mainNav.map((link) => (
              <Link key={link.href} href={link.href} className="text-base whitespace-nowrap transition-colors duration-200 hover:text-text-3">
                {link.label}
              </Link>
            ))}
            <Button href={primaryCta.href} className="whitespace-nowrap">
              {primaryCta.label}
            </Button>
          </nav>
          <MobileMenu links={[...mainNav, primaryCta]} bordered={!overlay} />
        </div>
      </Container>
    </header>
  );
}
