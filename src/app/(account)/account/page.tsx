import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerAccount } from "@/features/accounts/sections/customer-account";

export const metadata: Metadata = { title: "Your bookings", robots: { index: false } };

export default function AccountPage() {
  return (
    // Reads the session, so it streams in at request time.
    <Suspense fallback={<p className="text-text-3">Loading your bookings…</p>}>
      <CustomerAccount />
    </Suspense>
  );
}
