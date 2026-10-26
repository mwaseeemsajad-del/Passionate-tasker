import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountHeader, EmptyState } from "@/features/accounts/components/account-header";
import { ListTabs } from "@/features/accounts/components/list-tabs";
import { JobCard } from "@/features/provider/components/job-card";
import { loadProviderDashboard } from "@/features/provider/load";

export const metadata: Metadata = { title: "Your jobs", robots: { index: false } };

const TABS = [
  { id: "waiting", label: "Waiting for your answer" },
  { id: "booked", label: "Booked" },
  { id: "past", label: "Past" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function JobsPage({ searchParams }: PageProps<"/provider/jobs">) {
  return (
    <div className="grid gap-8">
      <AccountHeader eyebrow="Tradesperson dashboard" title="Your jobs">
        <p className="text-text-2">Every job our team has offered you: who booked it, what they need, and when.</p>
      </AccountHeader>
      <Suspense fallback={<p className="text-text-3">Loading your jobs…</p>}>
        <Jobs searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Jobs({ searchParams }: { searchParams: PageProps<"/provider/jobs">["searchParams"] }) {
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === raw) ? (raw as Tab) : "waiting";
  const d = await loadProviderDashboard();
  const lists: Record<Tab, typeof d.waiting> = { waiting: d.waiting, booked: d.booked, past: d.past };
  const shown = lists[tab];
  const empty: Record<Tab, string> = {
    waiting: "No jobs waiting for your answer.",
    booked: "No booked jobs. Jobs you accept appear here.",
    past: "No past jobs yet.",
  };

  return (
    <div className="grid gap-6">
      <ListTabs
        label="Job lists"
        current={tab}
        tabs={TABS.map((t) => ({ id: t.id, label: t.label, count: lists[t.id].length, href: t.id === "waiting" ? "/provider/jobs" : `/provider/jobs?tab=${t.id}` }))}
      />
      <h2 className="sr-only">{TABS.find((t) => t.id === tab)?.label}</h2>
      {shown.length > 0 ? <ul className="grid gap-4 2xl:grid-cols-2">{shown.map((b) => <JobCard key={b.id} booking={b} />)}</ul> : <EmptyState>{empty[tab]}</EmptyState>}
    </div>
  );
}
