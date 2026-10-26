import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarCheck, Clock, Inbox, UserRoundCheck } from "lucide-react";
import { MetricCard } from "@/components/ui";
import { AccountHeader, DashboardSection, EmptyState } from "@/features/accounts/components/account-header";
import { ProviderCard } from "@/features/admin/components/provider-card";
import { RequestCard } from "@/features/admin/components/request-card";
import { loadAdmin } from "@/features/admin/load";

export const metadata: Metadata = { title: "Team", robots: { index: false } };

export default function AdminOverviewPage() {
  return (
    // Reads the session, so it streams in at request time.
    <Suspense fallback={<p className="text-text-3">Loading…</p>}>
      <Overview />
    </Suspense>
  );
}

/** The team's start page: the numbers, then only what needs doing now. */
async function Overview() {
  const d = await loadAdmin();
  const nothingToDo = d.needsPerson.length === 0 && d.toApprove.length === 0;
  return (
    <div className="grid gap-12">
      <AccountHeader eyebrow="Team" title="Overview">
        <p className="text-text-2">Signed in as {d.viewer.email}</p>
      </AccountHeader>

      <section aria-labelledby="numbers-title">
        <h2 id="numbers-title" className="sr-only">
          Numbers
        </h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <MetricCard icon={Inbox} label="Need a tradesperson" value={d.needsPerson.length} href="/admin/requests" tone={d.needsPerson.length ? "alert" : "plain"} />
          <MetricCard icon={Clock} label="Waiting for an answer" value={d.offered.length} href="/admin/requests?tab=offered" />
          <MetricCard icon={CalendarCheck} label="Booked" value={d.booked.length} href="/admin/requests?tab=booked" />
          <MetricCard icon={UserRoundCheck} label="Tradespeople to approve" value={d.toApprove.length} href="/admin/tradespeople" tone={d.toApprove.length ? "alert" : "plain"} />
        </div>
      </section>

      {nothingToDo && <EmptyState>Nothing needs you right now. New requests and new tradespeople will show here.</EmptyState>}

      {d.needsPerson.length > 0 && (
        <DashboardSection
          id="needs-title"
          title="Do next: find a tradesperson"
          count={d.needsPerson.length}
          action={
            d.needsPerson.length > 2 && (
              <Link href="/admin/requests" className="font-semibold underline underline-offset-4">
                See all {d.needsPerson.length}
              </Link>
            )
          }
        >
          <ul className="grid gap-4 2xl:grid-cols-2">
            {d.needsPerson.slice(0, 2).map((b) => (
              <RequestCard key={b.id} booking={b} approved={d.approved} providerName={b.providerId ? d.nameOf(b.providerId) : null} />
            ))}
          </ul>
        </DashboardSection>
      )}

      {d.toApprove.length > 0 && (
        <DashboardSection
          id="approve-title"
          title="Do next: approve tradespeople"
          count={d.toApprove.length}
          action={
            d.toApprove.length > 2 && (
              <Link href="/admin/tradespeople" className="font-semibold underline underline-offset-4">
                See all {d.toApprove.length}
              </Link>
            )
          }
        >
          <ul className="grid gap-4 2xl:grid-cols-2">
            {d.toApprove.slice(0, 2).map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </ul>
        </DashboardSection>
      )}
    </div>
  );
}
