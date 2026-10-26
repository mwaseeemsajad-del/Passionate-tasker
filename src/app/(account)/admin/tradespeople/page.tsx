import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountHeader, EmptyState } from "@/features/accounts/components/account-header";
import { ListTabs } from "@/features/accounts/components/list-tabs";
import { ProviderCard } from "@/features/admin/components/provider-card";
import { loadAdmin } from "@/features/admin/load";

export const metadata: Metadata = { title: "Tradespeople", robots: { index: false } };

const TABS = [
  { id: "approve", label: "To approve", empty: "Nobody waiting. Tradespeople who finish joining appear here." },
  { id: "approved", label: "Approved", empty: "Nobody approved yet." },
  { id: "joining", label: "Still joining", empty: "Nobody part way through joining." },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function AdminTradespeoplePage({ searchParams }: PageProps<"/admin/tradespeople">) {
  return (
    <div className="grid gap-8">
      <AccountHeader eyebrow="Team" title="Tradespeople">
        <p className="text-text-2">Check each person’s ID, DBS, insurance and register on the phone, then press Approve. Approved people can be chosen by customers and get jobs automatically.</p>
      </AccountHeader>
      <Suspense fallback={<p className="text-text-3">Loading tradespeople…</p>}>
        <People searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function People({ searchParams }: { searchParams: PageProps<"/admin/tradespeople">["searchParams"] }) {
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === raw) ? (raw as Tab) : "approve";
  const d = await loadAdmin();
  const lists = { approve: d.toApprove, approved: d.approved, joining: d.joining };
  const shown = lists[tab];
  return (
    <div className="grid gap-6">
      <ListTabs
        label="Tradesperson lists"
        current={tab}
        tabs={TABS.map((t) => ({ id: t.id, label: t.label, count: lists[t.id].length, href: t.id === "approve" ? "/admin/tradespeople" : `/admin/tradespeople?tab=${t.id}` }))}
      />
      <h2 className="sr-only">{TABS.find((t) => t.id === tab)?.label}</h2>
      {shown.length > 0 ? (
        <ul className="grid gap-4 2xl:grid-cols-2">
          {shown.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </ul>
      ) : (
        <EmptyState>{TABS.find((t) => t.id === tab)?.empty}</EmptyState>
      )}
    </div>
  );
}
