import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { TwoStepSetup } from "@/features/accounts/components/two-step";
import { getViewer, homeFor } from "@/features/accounts/data";

export const metadata: Metadata = { title: "Two-step sign-in", robots: { index: false } };

export default function SecurityPage({ searchParams }: PageProps<"/security">) {
  return (
    <AuthPage
      eyebrow="Your account"
      title="Two-step sign-in"
      lede="A code from an app on your phone, asked each time you sign in. It keeps your account safe even if someone learns your password."
    >
      <Suspense fallback={<p className="text-text-3">Loading…</p>}>
        <Setup searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

/** Reads the session, so it renders per request. The team must keep it on. */
async function Setup({ searchParams }: Pick<PageProps<"/security">, "searchParams">) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/security");
  const { required } = await searchParams;
  const isAdmin = viewer.role === "admin";
  return (
    <div className="grid gap-6">
      {required && isAdmin && (
        <p id="two-step-title" className="rounded-lg border border-accent-stroke bg-accent-50 p-4 font-semibold">
          The team pages need two-step sign-in. Turn it on to open them.
        </p>
      )}
      <TwoStepSetup canTurnOff={!isAdmin} next={required && isAdmin ? "/admin" : null} />
      <a href={homeFor(viewer.role)} className="font-semibold underline underline-offset-4">
        Back to your dashboard
      </a>
    </div>
  );
}
