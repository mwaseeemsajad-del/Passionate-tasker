import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Container, Eyebrow } from "@/components/ui";
import { site } from "@/data/site";
import { BookingFlowLoader } from "@/features/booking/components/booking-flow-loader";
import { BookingTitle, DEFAULT_BOOKING_TITLE } from "@/features/booking/components/booking-title";

export const metadata: Metadata = {
  title: "Book a tradesperson",
  description: "Book a checked plumber, electrician, heating engineer or handyperson by voice or with a short form.",
  robots: { index: false },
};

export default function BookPage() {
  return (
    <>
      <Navbar variant="solid" />
      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="grid gap-10 pt-8 pb-4 lg:pt-12">
          <header className="grid max-w-[640px] gap-4">
            <Eyebrow>Book a job</Eyebrow>
            {/* The h1 names the trade from the address bar, so it renders in the browser too. */}
            <Suspense fallback={<h1 className="text-display">{DEFAULT_BOOKING_TITLE}</h1>}>
              <BookingTitle />
            </Suspense>
            <p className="text-text-2">
              Talk to us or fill in the form. It takes about two minutes. Prefer the phone? Call{" "}
              <a href={site.phone.href} className="font-semibold underline underline-offset-4">
                {site.phone.display}
              </a>
              , {site.supportHours}.
            </p>
          </header>
          {/* The form reads the address bar and today's date, so it renders in the browser. */}
          <Suspense fallback={<p className="text-text-3">Loading the booking form…</p>}>
            <BookingFlowLoader />
          </Suspense>
        </Container>
      </main>
    </>
  );
}
