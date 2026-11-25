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
  // The team's pages need two-step sign-in; the database refuses admin powers without it too (is_admin, 0011).
  if (role === "admin") {
    const supabase = await createClient();
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") redirect(aal?.nextLevel === "aal2" ? "/mfa?next=/admin" : "/security?required=1");
  }
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
  return r ? toProfile(r) : null;
}

export async function getProviderChecks(providerId: string): Promise<ProviderCheck[]> {
  const supabase = await createClient();
  const [{ data }, { data: docs }] = await Promise.all([
    supabase.from("provider_checks").select("id, provider_id, kind, status, note, expires_on").eq("provider_id", providerId),
    supabase.rpc("list_provider_documents"),
  ]);
  return toChecks(data ?? [], (docs ?? []) as DocRow[]);
}

type Row = Record<string, unknown>;
type DocRow = { provider_id: string; kind: string; path: string; file_name: string; uploaded_at: string };
const CHECK_ORDER = ["identity", "business", "dbs", "insurance", "gas-safe", "electrical"];

function toProfile(r: Row): ProviderProfile {
  return {
    id: r.id as string,
    trades: (r.trades as ProviderProfile["trades"]) ?? [],
    postcode: r.postcode as string,
    gasSafe: r.gas_safe as string,
    electricalScheme: r.electrical_scheme as string,
    about: r.about as string,
    businessType: (r.business_type as ProviderProfile["businessType"]) ?? "",
    businessName: (r.business_name as string) ?? "",
    companyNumber: (r.company_number as string) ?? "",
    businessAddress: (r.business_address as string) ?? "",
    languages: (r.languages as string[]) ?? ["English"],
    availableDays: (r.available_days as number[]) ?? [1, 2, 3, 4, 5, 6, 7],
    availableSlots: (r.available_slots as ProviderProfile["availableSlots"]) ?? ["morning", "afternoon", "evening"],
    onboardingStep: r.onboarding_step as number,
    onboardedAt: r.onboarded_at as string | null,
    status: r.status as ProviderProfile["status"],
  };
}

/** Checks in the order the site lists them, each with the documents sent for it. */
function toChecks(rows: Row[], docs: DocRow[]): ProviderCheck[] {
  return rows
    .map((c) => ({
      id: c.id as string,
      kind: c.kind as ProviderCheck["kind"],
      status: c.status as ProviderCheck["status"],
      note: c.note as string,
      expiresOn: c.expires_on as string | null,
      documents: docs
        .filter((d) => d.provider_id === c.provider_id && d.kind === c.kind)
        .map((d) => ({ path: d.path, fileName: d.file_name, uploadedAt: d.uploaded_at })),
    }))
    .sort((a, b) => CHECK_ORDER.indexOf(a.kind) - CHECK_ORDER.indexOf(b.kind));
}

/* ---- The team's view. Row Level Security only returns these rows to admins. ---- */

/** Every booking request, newest first. */
export async function getAllBookings(): Promise<(BookingRequest & { providerId: string | null })[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("booking_requests").select("*").order("created_at", { ascending: false }).limit(500);
  return (data ?? []).map((r) => ({ ...toBooking(r), providerId: r.provider_id as string | null }));
}

/** Every tradesperson with their contact details, checks, documents and history. */
export async function getAllProviders(): Promise<ProviderSummary[]> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: people }, { data: checks }, { data: docs }, { data: audit }] = await Promise.all([
    supabase.from("provider_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, phone, role"),
    supabase.from("provider_checks").select("id, provider_id, kind, status, note, expires_on"),
    supabase.rpc("list_provider_documents"),
    supabase.from("audit_log").select("actor_id, action, target_id, created_at").order("created_at", { ascending: false }).limit(1000),
  ]);
  const nameOf = (id: unknown) => (id ? (people ?? []).find((p) => p.id === id)?.full_name || "Someone on the team" : "Automatic (expiry)");
  return (profiles ?? []).map((r) => {
    const person = (people ?? []).find((p) => p.id === r.id);
    return {
      ...toProfile(r),
      fullName: person?.full_name ?? "",
      phone: person?.phone ?? "",
      checks: toChecks((checks ?? []).filter((c) => c.provider_id === r.id), (docs ?? []) as DocRow[]),
      history: (audit ?? [])
        .filter((a) => a.target_id === r.id)
        .slice(0, 10)
        .map((a) => ({ action: a.action as string, actorName: a.actor_id === r.id ? "Themselves" : nameOf(a.actor_id), createdAt: a.created_at as string })),
    };
  });
}
