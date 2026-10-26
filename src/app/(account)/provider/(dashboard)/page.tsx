import type { Metadata } from "next";
import { Suspense } from "react";
import { ProviderOverview } from "@/features/provider/sections/provider-overview";

export const metadata: Metadata = { title: "Your dashboard", robots: { index: false } };

export default function ProviderPage({ searchParams }: PageProps<"/provider">) {
  return (
    // Reads the session, so it streams in at request time.
    <Suspense fallback={<p className="text-text-3">Loading your dashboard…</p>}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({ searchParams }: { searchParams: PageProps<"/provider">["searchParams"] }) {
  const { welcome } = await searchParams;
  return <ProviderOverview welcome={welcome === "1"} />;
}
