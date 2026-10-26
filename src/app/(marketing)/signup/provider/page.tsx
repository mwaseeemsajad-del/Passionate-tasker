import type { Metadata } from "next";
import { CheckList } from "@/components/ui";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { SignUpForm } from "@/features/accounts/components/sign-up-form";

export const metadata: Metadata = {
  title: "Join as a tradesperson",
  description: "Create a tradesperson account, tell us your trade, and we arrange your checks before offering you jobs.",
};

export default function ProviderSignUpPage() {
  return (
    <AuthPage
      eyebrow="For tradespeople"
      title="Create your tradesperson account"
      lede="Three short steps after this: your trades and area, your registrations, and your checks. Then we start offering you jobs near you."
      aside={
        <div className="grid gap-4 rounded-lg border border-line bg-accent-50 p-6">
          <h2 className="text-h4">How joining works</h2>
          <CheckList
            items={[
              "Create your account and confirm your email",
              "Tell us your trades, area and registrations",
              "We check your ID, DBS, insurance and register",
              "Accept or decline the jobs we offer you",
            ]}
          />
        </div>
      }
    >
      <SignUpForm role="provider" />
    </AuthPage>
  );
}
