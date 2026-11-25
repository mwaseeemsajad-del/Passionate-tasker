import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { getService } from "@/data/services";
import { AccountHeader } from "@/features/accounts/components/account-header";
import { accountStatus } from "@/features/accounts/booking-status";
import { SLOTS } from "@/features/booking/draft";
import { loadProviderDashboard } from "@/features/provider/load";
import { BUSINESS_TYPES, DAYS } from "@/features/provider/onboarding";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default function ProviderProfilePage() {
  return (
    <div className="grid gap-8">
      <AccountHeader eyebrow="Tradesperson dashboard" title="Your profile" action={<Button href="/provider/onboarding">Edit trades, hours and business</Button>} />
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
    ["Languages", profile?.languages.join(", ") || "Not given"],
    ["Days you work", profile ? (profile.availableDays.length === 7 ? "Every day" : profile.availableDays.map((d) => DAYS[d - 1]).join(", ")) : "Not given"],
    ["Times you work", profile ? SLOTS.filter((s) => profile.availableSlots.includes(s.id)).map((s) => `${s.label} (${s.hours})`).join(", ") : "Not given"],
    ["Business", BUSINESS_TYPES.find((b) => b.value === profile?.businessType)?.label ?? "Not given yet"],
    ["Business name", profile?.businessName || "Your own name"],
    ...(profile?.businessType === "limited" ? [["Companies House number", profile.companyNumber || "Not given"] as [string, React.ReactNode]] : []),
    ["Business address", profile?.businessAddress || "Not given yet"],
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
