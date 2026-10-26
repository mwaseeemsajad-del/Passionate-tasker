import type { Metadata } from "next";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { ForgotPasswordForm } from "@/features/accounts/components/password-forms";

export const metadata: Metadata = { title: "Forgotten password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthPage eyebrow="Your account" title="Forgotten your password?" lede="Enter your email address and we will send you a link to choose a new one.">
      <ForgotPasswordForm />
    </AuthPage>
  );
}
