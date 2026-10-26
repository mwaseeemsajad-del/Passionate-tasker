import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Container, Eyebrow } from "@/components/ui";
import { OtherServices } from "@/features/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Plumbing, electrical, gas, heating, painting and decorating, carpentry and handyman jobs, by checked local tradespeople.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar variant="solid" />
      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="pt-8 lg:pt-12">
          <header className="grid max-w-[720px] gap-5">
            <Eyebrow>Our services</Eyebrow>
            <h1 className="text-display">Book a checked tradesperson</h1>
            <p className="text-text-2">
              Choose a trade to see its jobs and starting prices. Gas work is only done by Gas Safe registered engineers, and certified
              electrical work only by NICEIC or NAPIT members.
            </p>
          </header>
        </Container>
        <OtherServices />
      </main>
    </>
  );
}
