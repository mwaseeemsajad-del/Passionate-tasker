import type { Metadata } from "next";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { ResetPasswordForm } from "@/features/accounts/components/password-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthPage eyebrow="Your account" title="Choose a new password" lede="You opened the link from your email. Choose a new password to log in with.">
      <ResetPasswordForm />
    </AuthPage>
  );
}
