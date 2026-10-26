import type { Trade } from "./content";
import type { SlotId } from "@/features/booking/draft";

/*
 * Shapes of the account data stored in Supabase. Mirrors the tables in
 * supabase/migrations/0001_accounts_and_bookings.sql; keep the two in step.
 */

export type Role = "customer" | "provider" | "admin";

/** The signed-in person, as the app sees them. */
export type Viewer = { id: string; email: string; role: Role; fullName: string; phone: string };

export type ProviderStatus = "pending_checks" | "approved" | "paused";

export type ProviderProfile = {
  id: string;
  trades: Trade[];
  postcode: string;
  gasSafe: string;
  electricalScheme: string;
  about: string;
  /** How many onboarding steps are saved, 0 to 3. */
  onboardingStep: number;
  onboardedAt: string | null;
  status: ProviderStatus;
};

export type CheckKind = "identity" | "dbs" | "insurance" | "gas-safe" | "electrical";
export type CheckStatus = "not_started" | "submitted" | "approved" | "rejected";

export type ProviderCheck = { id: string; kind: CheckKind; status: CheckStatus; note: string; expiresOn: string | null };

/** A tradesperson as the team sees them: profile, contact details and checks together. */
export type ProviderSummary = ProviderProfile & { fullName: string; phone: string; checks: ProviderCheck[] };

export type BookingStatus = "new" | "offered" | "accepted" | "declined" | "completed" | "cancelled";

export type BookingRequest = {
  id: string;
  reference: string;
  trade: Trade;
  job: string;
  postcode: string;
  details: string;
  preferredDate: string;
  slot: SlotId;
  name: string;
  phone: string;
  email: string;
  status: BookingStatus;
  createdAt: string;
  /** How the tradesperson was found: chosen by the customer, matched automatically, or by the team. */
  matchMode: "customer" | "auto" | "team";
  /** First name and initial of the tradesperson coming, shown to the customer once booked. */
  providerName?: string;
};
