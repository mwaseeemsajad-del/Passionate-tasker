import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { site } from "@/data/site";
import { AccountHeader } from "@/features/accounts/components/account-header";
import { requireRole } from "@/features/accounts/data";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default function CustomerProfilePage() {
  return (
    <div className="grid gap-8">
      <AccountHeader eyebrow="Your account" title="Your profile" />
      <Suspense fallback={<p className="text-text-3">Loading your profile…</p>}>
        <Profile />
      </Suspense>
    </div>
  );
}

async function Profile() {
  const viewer = await requireRole("customer");
  const rows: [string, string][] = [
    ["Name", viewer.fullName || "Not given"],
    ["Email", viewer.email],
    ["Phone", viewer.phone || "Not given"],
  ];
  return (
    <div className="grid gap-4">
      <Card className="p-0">
        <dl className="divide-y divide-line">
          {rows.map(([term, value]) => (
            <div key={term} className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
              <dt className="font-semibold">{term}</dt>
              <dd className="text-text-2">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <p className="text-text-3">
        To change these details, call us on{" "}
        <a href={site.phone.href} className="font-semibold underline underline-offset-4">
          {site.phone.display}
        </a>
        . To change your password, use “Forgotten your password” on the login page.
      </p>
    </div>
  );
}
