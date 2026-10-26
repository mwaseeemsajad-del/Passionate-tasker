"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/accounts/data";
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
  return call("admin_set_booking_status", { p_booking: bookingId, p_status: status }, "Could not change this request");
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
