"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireRole } from "@/features/accounts/data";
import { BOOKING_COLUMNS, emailBookingCancelled, type BookingRow } from "@/features/booking/emails";
import { createClient } from "@/lib/supabase/server";
import type { CheckStatus, ProviderStatus } from "@/types/accounts";

/*
 * The team's actions. Each one checks the caller is an admin here, and the
 * database function checks again, so neither check alone is relied on.
 */

export type AdminResult = { ok: true } | { ok: false; message: string };

async function call(fn: string, args: Record<string, unknown>, fallback: string): Promise<AdminResult> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, message: error.message || fallback };
  // Every team page (overview, requests, tradespeople) shows these numbers.
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function offerBooking(bookingId: string, providerId: string) {
  if (!providerId) return { ok: false, message: "Choose a tradesperson first" } satisfies AdminResult;
  return call("admin_offer_booking", { p_booking: bookingId, p_provider: providerId }, "Could not offer this job");
}

export async function setBookingStatus(bookingId: string, status: "new" | "cancelled" | "completed") {
  const result = await call("admin_set_booking_status", { p_booking: bookingId, p_status: status }, "Could not change this request");
  if (result.ok && status === "cancelled") {
    const supabase = await createClient();
    const { data: booking } = await supabase.from("booking_requests").select(BOOKING_COLUMNS).eq("id", bookingId).maybeSingle<BookingRow>();
    if (booking) after(() => emailBookingCancelled(booking, "team"));
  }
  return result;
}

export async function setCheck(checkId: string, status: CheckStatus, note: string, expiresOn: string) {
  return call("admin_set_check", { p_check: checkId, p_status: status, p_note: note, p_expires: expiresOn || null }, "Could not save this check");
}

export async function setProviderStatus(providerId: string, status: ProviderStatus) {
  return call("admin_set_provider_status", { p_provider: providerId, p_status: status }, "Could not change this tradesperson");
}

/** Approve a tradesperson in one step: every check, then the account. */
export async function approveProvider(providerId: string) {
  return call("admin_approve_provider", { p_provider: providerId }, "Could not approve this tradesperson");
}
