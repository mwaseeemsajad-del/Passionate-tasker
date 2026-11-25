import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { TwoStepChallenge } from "@/features/accounts/components/two-step";

export const metadata: Metadata = { title: "Enter your code", robots: { index: false } };

/** Two-step sign-in is on: the proxy sends signed-in sessions here until the code is given. */
export default function MfaPage({ searchParams }: PageProps<"/mfa">) {
  return (
    <AuthPage eyebrow="Two-step sign-in" title="Enter your code" lede="Open your authenticator app and type the 6-digit code it shows for Passionate Taskers.">
      <Suspense fallback={<p className="text-text-3">Loading…</p>}>
        <Challenge searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function Challenge({ searchParams }: Pick<PageProps<"/mfa">, "searchParams">) {
  const { next } = await searchParams;
  return <TwoStepChallenge next={typeof next === "string" ? next : null} />;
}
