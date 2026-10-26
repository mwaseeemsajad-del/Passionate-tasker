"use server";

import { site } from "@/data/site";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { DAYS_AHEAD, formatPostcode, upcomingDays, validateStep, type Draft, type FieldError } from "./draft";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SubmitResult = { ok: true; reference: string } | { ok: false; errors: FieldError[] };

/*
 * Receives a booking request. The server checks every answer again: the
 * browser's checks are for the person's convenience, these are the real ones.
 *
 * Saved in Supabase through the `create_booking_request` function, which
 * links it to the customer's account when they are signed in. The team sees
 * new requests in the `booking_requests` table.
 * TODO(input N2): email the team about each new request.
 */
export async function submitBookingRequest(draft: Draft): Promise<SubmitResult> {
  // One day either side, so a request sent just before midnight in another
  // time zone is not rejected.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const days = upcomingDays(DAYS_AHEAD + 2, yesterday);

  const errors = [0, 1, 2].flatMap((step) => validateStep(step, draft, days));
  if (errors.length > 0) return { ok: false, errors };

  // Without Supabase settings (a local copy with no .env.local) the form still works as a demo.
  if (!supabaseConfigured) return { ok: true, reference: `PT${Math.random().toString(36).slice(2, 7).toUpperCase()}` };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_booking_request", {
    p_trade: draft.trade,
    p_job: draft.job,
    p_postcode: formatPostcode(draft.postcode),
    p_details: draft.details,
    p_date: draft.date,
    p_slot: draft.slot,
    p_name: draft.name,
    p_phone: draft.phone,
    p_email: draft.email,
    // The customer's choice, if any. The database checks they are approved for this trade,
    // and otherwise matches automatically.
    p_provider: UUID.test(draft.provider) ? draft.provider : null,
  });
  if (error || typeof data !== "string") {
    console.error("create_booking_request failed", error?.message);
    const message = /too many requests/i.test(error?.message ?? "")
      ? `You have sent several requests in the last hour from this phone number. Please call us on ${site.phone.display} and we will help straight away.`
      : "We could not send your request just now. Please try again, or call us and we will book it for you.";
    return { ok: false, errors: [{ id: "step-title", message }] };
  }
  return { ok: true, reference: data };
}
