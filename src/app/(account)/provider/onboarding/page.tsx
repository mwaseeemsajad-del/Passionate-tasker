import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Container, Eyebrow } from "@/components/ui";
import { getProviderProfile, requireRole } from "@/features/accounts/data";
import { OnboardingWizard } from "@/features/provider/components/onboarding-wizard";

export const metadata: Metadata = { title: "Finish joining", robots: { index: false } };

export default function OnboardingPage() {
  return (
    <>
      <Navbar variant="solid" />
      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="grid max-w-[760px] gap-10 pt-8 pb-16 lg:pt-12">
          <header className="grid gap-4">
            <Eyebrow>For tradespeople</Eyebrow>
            <h1 className="text-display">Finish joining</h1>
            <p className="text-text-2">Three short steps. Each one is saved as you go, so you can stop and come back.</p>
          </header>
          <Suspense fallback={<p className="text-text-3">Loading your details…</p>}>
            <Wizard />
          </Suspense>
        </Container>
      </main>
    </>
  );
}

async function Wizard() {
  const viewer = await requireRole("provider");
  const profile = await getProviderProfile(viewer.id);
  if (!profile) return <p className="text-text-2">We could not find your tradesperson details. Please call us.</p>;
  return <OnboardingWizard profile={profile} />;
}
