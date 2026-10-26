import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountHeader, EmptyState } from "@/features/accounts/components/account-header";
import { ListTabs } from "@/features/accounts/components/list-tabs";
import { RequestCard } from "@/features/admin/components/request-card";
import { loadAdmin } from "@/features/admin/load";

export const metadata: Metadata = { title: "Requests", robots: { index: false } };

const TABS = [
  { id: "needs", label: "Need a tradesperson", empty: "Nothing waiting. New requests that no one has been matched to appear here." },
  { id: "offered", label: "Waiting for an answer", empty: "No jobs waiting for a tradesperson to answer." },
  { id: "booked", label: "Booked", empty: "No booked jobs." },
  { id: "closed", label: "Done and cancelled", empty: "Nothing finished yet." },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function AdminRequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  return (
    <div className="grid gap-8">
      <AccountHeader eyebrow="Team" title="Requests">
        <p className="text-text-2">Every booking request. Offer one to a tradesperson, or cancel, reopen or close it.</p>
      </AccountHeader>
      <Suspense fallback={<p className="text-text-3">Loading requests…</p>}>
        <Requests searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Requests({ searchParams }: { searchParams: PageProps<"/admin/requests">["searchParams"] }) {
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === raw) ? (raw as Tab) : "needs";
  const d = await loadAdmin();
  const lists = { needs: d.needsPerson, offered: d.offered, booked: d.booked, closed: d.closed };
  const shown = lists[tab];
  return (
    <div className="grid gap-6">
      <ListTabs
        label="Request lists"
        current={tab}
        tabs={TABS.map((t) => ({ id: t.id, label: t.label, count: lists[t.id].length, href: t.id === "needs" ? "/admin/requests" : `/admin/requests?tab=${t.id}` }))}
      />
      <h2 className="sr-only">{TABS.find((t) => t.id === tab)?.label}</h2>
      {shown.length > 0 ? (
        <ul className="grid gap-4 2xl:grid-cols-2">
          {shown.map((b) => (
            <RequestCard key={b.id} booking={b} approved={d.approved} providerName={b.providerId ? d.nameOf(b.providerId) : null} />
          ))}
        </ul>
      ) : (
        <EmptyState>{TABS.find((t) => t.id === tab)?.empty}</EmptyState>
      )}
    </div>
  );
}
