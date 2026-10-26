import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui";
import { DashboardNav, type DashboardNavItem } from "./dashboard-nav";

/*
 * The frame of every dashboard: the site header, then the dashboard's own
 * navigation beside the page. Static, so it shows at once; each page streams
 * its signed-in content in behind its own Suspense boundary.
 */
export function DashboardShell({ nav, navLabel, children }: { nav: DashboardNavItem[]; navLabel: string; children: ReactNode }) {
  return (
    <>
      <Navbar variant="solid" />
      <Container className="grid items-start gap-8 pt-6 pb-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:pt-10">
        <DashboardNav items={nav} label={navLabel} />
        <main id="main" tabIndex={-1} className="min-w-0 outline-none">
          {children}
        </main>
      </Container>
    </>
  );
}

export const providerNav: DashboardNavItem[] = [
  { label: "Overview", href: "/provider", icon: "overview" },
  { label: "Jobs", href: "/provider/jobs", icon: "jobs" },
  { label: "Checks", href: "/provider/checks", icon: "checks" },
  { label: "Profile", href: "/provider/profile", icon: "profile" },
];

export const customerNav: DashboardNavItem[] = [
  { label: "My bookings", href: "/account", icon: "bookings" },
  { label: "Book a job", href: "/book", icon: "book" },
  { label: "Profile", href: "/account/profile", icon: "profile" },
];

export const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "overview" },
  { label: "Requests", href: "/admin/requests", icon: "requests" },
  { label: "Tradespeople", href: "/admin/tradespeople", icon: "people" },
];
