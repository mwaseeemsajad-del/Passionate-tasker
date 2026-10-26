import type { Metadata } from "next";
import { CheckList } from "@/components/ui";
import { AuthPage } from "@/features/accounts/components/auth-page";
import { SignUpForm } from "@/features/accounts/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a free account to see every booking you make and its progress in one place.",
};

export default function SignUpPage() {
  return (
    <AuthPage
      eyebrow="For customers"
      title="Create an account"
      lede="Free, and it takes a minute. You can still book without one."
      aside={
        <div className="grid gap-4 rounded-lg border border-line bg-accent-50 p-6">
          <h2 className="text-h4">With an account you can</h2>
          <CheckList items={["See every booking and where it is up to", "See who is coming once it is arranged", "Cancel a request online"]} />
        </div>
      }
    >
      <SignUpForm role="customer" />
    </AuthPage>
  );
}
