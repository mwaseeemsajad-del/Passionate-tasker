import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/data/site";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { LoginForm } from "@/features/accounts/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to see your bookings, or your jobs if you are a tradesperson.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthPage
      eyebrow="Your account"
      title="Log in"
      lede={
        <>
          See your bookings, or your jobs if you are a tradesperson. You do not need an account to book: you can book by voice, with the form, or
          by calling <a href={site.phone.href} className="font-semibold underline underline-offset-4">{site.phone.display}</a>.
        </>
      }
    >
      {/* Reads ?next= and ?error= from the address bar, so it renders in the browser. */}
      <Suspense fallback={<p className="text-text-3">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthPage>
  );
}
