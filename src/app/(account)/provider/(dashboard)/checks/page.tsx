import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { site } from "@/data/site";
import { recheckNote } from "@/data/trust";
import { AccountHeader } from "@/features/accounts/components/account-header";
import { CheckRow } from "@/features/provider/components/check-list-card";
import { loadProviderDashboard } from "@/features/provider/load";

export const metadata: Metadata = { title: "Your checks", robots: { index: false } };

export default function ChecksPage() {
  return (
    <div className="grid gap-8">
      <AccountHeader eyebrow="Tradesperson dashboard" title="Your checks">
        <p className="text-text-2">{recheckNote}</p>
      </AccountHeader>
      <Suspense fallback={<p className="text-text-3">Loading your checks…</p>}>
        <Checks />
      </Suspense>
    </div>
  );
}

async function Checks() {
  const d = await loadProviderDashboard();
  const total = d.checks.length || 1;
  const percent = Math.round((d.checksDone / total) * 100);
  return (
    <div className="grid gap-6">
      <Card variant="tint" className="grid gap-3">
        <p className="text-h4">
          {d.checksDone} of {d.checks.length} checks done
        </p>
        <div role="progressbar" aria-label="Checks done" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-text-2">
          {d.checksDone === d.checks.length
            ? "Every check is done."
            : "We call you to see each document. Press “I have sent this to the team” when you have sent one, so we know to look for it."}
        </p>
      </Card>
      <ul className="grid divide-y divide-line rounded-lg border border-line bg-white px-5">{d.checks.map((c) => <CheckRow key={c.id} check={c} />)}</ul>
      <p className="text-text-2">
        Questions about a check? Call us on{" "}
        <a href={site.phone.href} className="font-semibold underline underline-offset-4">
          {site.phone.display}
        </a>
        , {site.supportHours}.
      </p>
    </div>
  );
}
