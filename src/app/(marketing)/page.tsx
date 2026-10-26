import {
  About,
  CtaBand,
  Faq,
  Guides,
  Hero,
  HowItWorks,
  Pricing,
  RecentJobs,
  RegistersStrip,
  Services,
  Testimonials,
  WhyChoose,
} from "@/features/landing";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <RegistersStrip />
      <About />
      <WhyChoose />
      <HowItWorks />
      <Services />
      <Pricing />
      <RecentJobs />
      <Testimonials />
      <Guides />
      <CtaBand />
      <Faq />
      </main>
    </>
  );
}
