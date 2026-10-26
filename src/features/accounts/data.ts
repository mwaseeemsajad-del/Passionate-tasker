import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BookingRequest, ProviderCheck, ProviderProfile, ProviderSummary, Role, Viewer } from "@/types/accounts";

/*
 * The data access layer for accounts: the only place that reads account data
 * from Supabase. Row Level Security already limits every query to the
 * signed-in person's own rows; these helpers add the page-level rules (who
 * may open which dashboard).
 */

/** The signed-in person, or null. */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const id = claims?.claims?.sub;
  if (!id) return null;
  const { data: profile } = await supabase.from("profiles").select("role, full_name, phone").eq("id", id).maybeSingle();
  if (!profile) return null;
  return {
    id,
    email: String(claims.claims.email ?? ""),
    role: profile.role as Role,
    fullName: profile.full_name,
    phone: profile.phone,
  };
}

/** Where each kind of account lands after signing in. */
export const homeFor = (role: Role) => (role === "provider" ? "/provider" : role === "admin" ? "/admin" : "/account");

/** The signed-in person, who must have this role; anyone else is sent to the right place. */
export async function requireRole(role: Role): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${homeFor(role)}`);
  if (viewer.role !== role) redirect(homeFor(viewer.role));
  return viewer;
}

const toBooking = (r: Record<string, unknown>): BookingRequest => ({
  id: r.id as string,
  reference: r.reference as string,
  trade: r.trade as BookingRequest["trade"],
  job: r.job as string,
  postcode: r.postcode as string,
  details: r.details as string,
  preferredDate: r.preferred_date as string,
  slot: r.slot as BookingRequest["slot"],
  name: r.name as string,
  phone: r.phone as string,
  email: r.email as string,
  status: r.status as BookingRequest["status"],
  createdAt: r.created_at as string,
  matchMode: (r.match_mode as BookingRequest["matchMode"]) ?? "team",
});

/** Bookings the signed-in customer has sent, newest first. */
export async function getCustomerBookings(customerId: string): Promise<BookingRequest[]> {
  const supabase = await createClient();
  const [{ data }, { data: coming }] = await Promise.all([
    supabase.from("booking_requests").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
    supabase.rpc("my_booking_providers"),
  ]);
  const names = new Map(((coming ?? []) as { booking_id: string; provider_name: string }[]).map((c) => [c.booking_id, c.provider_name]));
  return (data ?? []).map((r) => ({ ...toBooking(r), providerName: names.get(r.id as string) }));
}

/** Jobs offered to the signed-in provider, soonest first. */
export async function getProviderBookings(providerId: string): Promise<BookingRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("booking_requests").select("*").eq("provider_id", providerId).order("preferred_date", { ascending: true });
  return (data ?? []).map(toBooking);
}

export async function getProviderProfile(providerId: string): Promise<ProviderProfile | null> {
  const supabase = await createClient();
  const { data: r } = await supabase.from("provider_profiles").select("*").eq("id", providerId).maybeSingle();
  if (!r) return null;
  return {
    id: r.id,
    trades: r.trades ?? [],
    postcode: r.postcode,
    gasSafe: r.gas_safe,
    electricalScheme: r.electrical_scheme,
    about: r.about,
    onboardingStep: r.onboarding_step,
    onboardedAt: r.onboarded_at,
    status: r.status,
  };
}

export async function getProviderChecks(providerId: string): Promise<ProviderCheck[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("provider_checks").select("id, kind, status, note, expires_on").eq("provider_id", providerId);
  const order = ["identity", "dbs", "insurance", "gas-safe", "electrical"];
  return (data ?? [])
    .map((c) => ({ id: c.id, kind: c.kind, status: c.status, note: c.note, expiresOn: c.expires_on }))
    .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}

/* ---- The team's view. Row Level Security only returns these rows to admins. ---- */

/** Every booking request, newest first. */
export async function getAllBookings(): Promise<(BookingRequest & { providerId: string | null })[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("booking_requests").select("*").order("created_at", { ascending: false }).limit(500);
  return (data ?? []).map((r) => ({ ...toBooking(r), providerId: r.provider_id as string | null }));
}

/** Every tradesperson with their contact details and checks. */
export async function getAllProviders(): Promise<ProviderSummary[]> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: people }, { data: checks }] = await Promise.all([
    supabase.from("provider_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, phone").eq("role", "provider"),
    supabase.from("provider_checks").select("id, provider_id, kind, status, note, expires_on"),
  ]);
  const order = ["identity", "dbs", "insurance", "gas-safe", "electrical"];
  return (profiles ?? []).map((r) => {
    const person = (people ?? []).find((p) => p.id === r.id);
    return {
      id: r.id,
      trades: r.trades ?? [],
      postcode: r.postcode,
      gasSafe: r.gas_safe,
      electricalScheme: r.electrical_scheme,
      about: r.about,
      onboardingStep: r.onboarding_step,
      onboardedAt: r.onboarded_at,
      status: r.status,
      fullName: person?.full_name ?? "",
      phone: person?.phone ?? "",
      checks: (checks ?? [])
        .filter((c) => c.provider_id === r.id)
        .map((c) => ({ id: c.id, kind: c.kind, status: c.status, note: c.note, expiresOn: c.expires_on }))
        .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)),
    };
  });
}
