import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { WelcomeForm } from "@/features/accounts/components/welcome-form";
import { getViewer, homeFor } from "@/features/accounts/data";

export const metadata: Metadata = { title: "Finish setting up", robots: { index: false } };

/** First Google sign-in lands here (see /auth/confirm). */
export default function WelcomePage() {
  return (
    <AuthPage eyebrow="Welcome" title="Finish setting up" lede="Two quick questions and your account is ready.">
      <Suspense fallback={<p className="text-text-3">Loading…</p>}>
        <Gate />
      </Suspense>
    </AuthPage>
  );
}

/** Reads the session, so it renders per request. Anyone already set up goes home. */
async function Gate() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/welcome");
  if (viewer.phone) redirect(homeFor(viewer.role));
  return <WelcomeForm />;
}
