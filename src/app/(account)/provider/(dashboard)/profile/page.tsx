import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { getService } from "@/data/services";
import { AccountHeader } from "@/features/accounts/components/account-header";
import { accountStatus } from "@/features/accounts/booking-status";
import { loadProviderDashboard } from "@/features/provider/load";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default function ProviderProfilePage() {
  return (
    <div className="grid gap-8">
      <AccountHeader eyebrow="Tradesperson dashboard" title="Your profile" action={<Button href="/provider/onboarding">Edit trades and area</Button>} />
      <Suspense fallback={<p className="text-text-3">Loading your profile…</p>}>
        <Profile />
      </Suspense>
    </div>
  );
}

async function Profile() {
  const { viewer, profile } = await loadProviderDashboard();
  const rows: [string, React.ReactNode][] = [
    ["Name", viewer.fullName || "Not given"],
    ["Email", viewer.email],
    ["Phone", viewer.phone || "Not given"],
    ["Account", profile ? accountStatus[profile.status] : "Not found"],
    ["Area", profile?.postcode || "Not given yet"],
    [
      "Trades",
      profile?.trades.length ? (
        <span className="flex flex-wrap gap-2">
          {profile.trades.map((t) => (
            <Badge key={t}>{getService(t)?.name ?? t}</Badge>
          ))}
        </span>
      ) : (
        "Not chosen yet"
      ),
    ],
    ["Gas Safe number", profile?.gasSafe || "Not needed or not given"],
    ["Electrical scheme", profile?.electricalScheme || "Not needed or not given"],
    ["About your work", profile?.about || "Not written yet"],
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
      <p className="text-text-3">To change your name, phone number or email address, call us.</p>
    </div>
  );
}
